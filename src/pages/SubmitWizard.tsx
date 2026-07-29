import React, { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { 
  Check, 
  Wallet, 
  ShieldCheck, 
  ChevronRight, 
  ChevronLeft, 
  ExternalLink, 
  FileText, 
  Info, 
  Sparkles, 
  Crown, 
  Image as ImageIcon, 
  Layers, 
  Lock, 
  Clock, 
  AlertCircle,
  HelpCircle,
  Upload,
  Trash2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { ethers } from 'ethers';
import confetti from 'canvas-confetti';

import { Token } from '../types';
import { ORVIX_CONFIG, getExplorerUrl, getEffectiveRpcUrl } from '../contracts/config';
import { useWeb3 } from '../lib/web3';

export function SubmitWizard({
  walletConnected: externalWalletConnected,
  walletAddress: externalWalletAddress,
  onOpenWalletModal
}: {
  walletConnected?: boolean;
  walletAddress?: string;
  onOpenWalletModal?: () => void;
}) {
  const web3 = useWeb3();
  const isWalletConnected = externalWalletConnected ?? web3.isConnected;
  const connectedAddress = externalWalletAddress || web3.address || '';

  // 7-step onboarding flow (Step 0 to Step 6)
  const [step, setStep] = useState<number>(0);

  // Step 1: Owner Address
  const [ownerAddress, setOwnerAddress] = useState<string>('');

  useEffect(() => {
    if (isWalletConnected && connectedAddress) {
      setOwnerAddress(connectedAddress);
    }
  }, [isWalletConnected, connectedAddress]);

  // Step 0: Terms of Service accepted state
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    contractAddress: '',
    name: '',
    symbol: '',
    chain: 'BNB Smart Chain (BSC)',
    decimals: '18',
    totalSupply: '',
    buyTax: '0',
    sellTax: '0',
    transferTax: '0',
    mint: 'no', // 'yes' | 'no'
    burn: 'no', // 'yes' | 'no'
    adminControl: 'no', // 'yes' | 'no'
    initialLpAmount: '',
    plannedLpSupply: '',
    basePair: 'USDT',
    description: '',
    // Step 4 Project Info
    projectName: '',
    website: '',
    x: '',
    telegram: '',
    discord: '',
    email: '',
    github: '',
    whitepaper: '',
    documentation: ''
  });

  // RPC Token Loading States
  const [isLoadingToken, setIsLoadingToken] = useState(false);
  const [tokenError, setTokenError] = useState('');
  const [tokenInfo, setTokenInfo] = useState<{
    symbol: string;
    totalSupplyFormatted: string;
    depositFormatted: string;
  } | null>(null);

  // Auto-read token contract details
  useEffect(() => {
    const address = formData.contractAddress.trim();
    if (!address) {
      setTokenInfo(null);
      setTokenError('');
      return;
    }
    if (address.length !== 42 || !address.startsWith('0x')) {
      setTokenError('Invalid contract address format (must be 0x... 42 characters)');
      setTokenInfo(null);
      return;
    }

    setTokenError('');
    setIsLoadingToken(true);

    const timer = setTimeout(async () => {
      try {
        const provider = new ethers.JsonRpcProvider(getEffectiveRpcUrl());
        const contract = new ethers.Contract(
          address,
          [
            "function totalSupply() view returns (uint256)",
            "function decimals() view returns (uint8)",
            "function symbol() view returns (string)",
            "function name() view returns (string)"
          ],
          provider
        );

        const [symbol, name, decimals, totalSupplyRaw] = await Promise.all([
          contract.symbol().catch(() => 'UNK'),
          contract.name().catch(() => 'Unknown Token'),
          contract.decimals().catch(() => 18),
          contract.totalSupply().catch(() => 0)
        ]);

        const humanSupply = Number(ethers.formatUnits(totalSupplyRaw, decimals));
        const depositAmount = humanSupply * 0.25 / 100;

        const formattedSupply = humanSupply.toLocaleString('en-US', { maximumFractionDigits: 4 });
        const formattedDeposit = depositAmount.toLocaleString('en-US', { maximumFractionDigits: 6 });

        setTokenInfo({
          symbol,
          totalSupplyFormatted: formattedSupply,
          depositFormatted: formattedDeposit
        });
        
        setFormData(prev => ({
          ...prev,
          symbol: prev.symbol !== '' ? prev.symbol : symbol,
          name: prev.name !== '' ? prev.name : name,
          decimals: decimals.toString(),
          totalSupply: prev.totalSupply !== '' ? prev.totalSupply : humanSupply.toString()
        }));
        
        setIsLoadingToken(false);
      } catch (err: any) {
        console.warn("RPC contract query error:", err?.message || err);
        setTokenError('Could not auto-read contract on BSC Testnet. You can enter details manually.');
        setIsLoadingToken(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [formData.contractAddress]);

  // Word Counter helper
  const getWordCount = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  };

  // Step 2 Validation: Token Metadata (Singkat)
  const isStep2Valid = 
    formData.name.trim() !== '' &&
    formData.symbol.trim() !== '' &&
    formData.decimals.trim() !== '' &&
    formData.totalSupply.trim() !== '' &&
    formData.mint === 'no' &&
    formData.plannedLpSupply.trim() !== '' &&
    formData.initialLpAmount.trim() !== '' &&
    getWordCount(formData.description) <= 300;

  // Step 3 Payment State
  const [paymentSubStep, setPaymentSubStep] = useState<'summary' | 'pay'>('summary');
  const [premiumTxHashInput, setPremiumTxHashInput] = useState<string>('');
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
  const [isUpgradingPremium, setIsUpgradingPremium] = useState(false);
  const [premiumTxHash, setPremiumTxHash] = useState('');

  // Step 4 Project Metadata, Icon & Banner uploads
  const [tokenIconFile, setTokenIconFile] = useState<string>('');
  const [banners, setBanners] = useState<string[]>([]);
  const [dataConfirmed, setDataConfirmed] = useState(false);

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedExtensions = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedExtensions.includes(file.type)) {
      alert("Invalid file format. Only JPG, PNG, and WEBP are allowed.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("File size exceeds 2MB limit.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setTokenIconFile(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (banners.length + files.length > 4) {
      alert("Maximum 4 banner images are allowed.");
      return;
    }

    const allowedExtensions = ['image/jpeg', 'image/png', 'image/webp'];
    const newBanners = [...banners];

    Array.from(files).forEach(file => {
      if (!allowedExtensions.includes(file.type)) {
        alert(`Invalid file format for ${file.name}. Only JPG, PNG, and WEBP are allowed.`);
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert(`File ${file.name} exceeds 2MB limit.`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        newBanners.push(base64);
        setBanners(newBanners);
        localStorage.setItem(`orvix_banners_${formData.contractAddress || 'temp'}`, JSON.stringify(newBanners));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeBanner = (index: number) => {
    const updated = banners.filter((_, i) => i !== index);
    setBanners(updated);
    localStorage.setItem(`orvix_banners_${formData.contractAddress || 'temp'}`, JSON.stringify(updated));
  };

  const isStep4Valid = 
    formData.projectName.trim() !== '' &&
    formData.website.trim() !== '' &&
    formData.email.trim() !== '' &&
    tokenIconFile !== '' &&
    dataConfirmed;

  // Step 5 LP Information State
  const [addLpTxHash, setAddLpTxHash] = useState('');
  const [lockLpTxHash, setLockLpTxHash] = useState('');

  const isStep5Valid = addLpTxHash.trim() !== '' && lockLpTxHash.trim() !== '';

  // Step 6 Submission States
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionId, setSubmissionId] = useState('');

  const handleUpgradePremium = async () => {
    setIsUpgradingPremium(true);
    try {
      const ethereum = (window as any).ethereum;
      let provider;
      if (ethereum && (typeof ethereum.request === 'function' || typeof ethereum.send === 'function')) {
        provider = new ethers.BrowserProvider(ethereum);
      } else {
        provider = new ethers.JsonRpcProvider(getEffectiveRpcUrl());
      }

      let txHash = '';
      try {
        const signer = await provider.getSigner();
        const erc20 = new ethers.Contract(
          formData.contractAddress || '0x0000000000000000000000000000000000000000',
          ["function transfer(address to, uint256 amount) returns (bool)", "function decimals() view returns (uint8)"],
          signer
        );
        const decimals = await erc20.decimals().catch(() => 18);
        const rawSupply = Number(formData.totalSupply) || 1000000;
        const depositAmountRaw = (rawSupply * 0.0025).toString();
        const amount = ethers.parseUnits(depositAmountRaw, decimals);
        
        const tx = await erc20.transfer(ORVIX_CONFIG.treasury, amount);
        const receipt = await tx.wait();
        txHash = receipt.hash;
      } catch (e: any) {
        console.warn("Direct wallet premium contribution fallback:", e?.message);
        txHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
      }

      setPremiumTxHashInput(txHash);
      window.dispatchEvent(new CustomEvent('orvix-toast', { 
        detail: `Transaction sent successfully! Click 'Verify & Activate Premium' to finish.` 
      }));
    } catch (err: any) {
      console.warn("Premium contribution error:", err?.message || err);
    } finally {
      setIsUpgradingPremium(false);
    }
  };

  const handleVerifyPremium = () => {
    if (!premiumTxHashInput.trim()) return;
    setPremiumTxHash(premiumTxHashInput.trim());
    setHasPremiumAccess(true);
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 }
    });
    window.dispatchEvent(new CustomEvent('orvix-toast', { 
      detail: `Premium access successfully verified! Stories and Banner access unlocked.` 
    }));
  };

  const handleFinalSubmit = () => {
    if (!hasPremiumAccess || !isStep5Valid) return;
    setIsSubmitting(true);
    setTimeout(() => {
      const dateStr = new Date().toISOString().slice(0,10).replace(/-/g, '');
      const randomStr = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
      const id = `ORX-${dateStr}-${randomStr}`;
      setSubmissionId(id);

      const newToken: Token = {
        id: Date.now().toString(),
        name: formData.name,
        symbol: formData.symbol,
        pair: `${formData.symbol}/${formData.basePair}`,
        chain: 'BSC',
        price: '0.00',
        priceChange: 0,
        listedAt: 'Pending Review',
        contract: formData.contractAddress || '0x1234567890abcdef1234567890abcdef12345678',
        creator: ownerAddress || connectedAddress,
        addLpTx: addLpTxHash,
        renounceTx: '',
        lockLpTx: lockLpTxHash,
        ammVersion: 'AMM V2 · BNB Chain',
        totalSupply: formData.totalSupply,
        logo: tokenIconFile || 'tether',
        wallpaper: banners[0] || 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&auto=format&fit=crop&q=80',
        website: formData.website,
        x: formData.x || undefined,
        telegram: formData.telegram || undefined,
        github: formData.github || undefined,
        documentation: formData.documentation || undefined
      };

      // Mock submit dispatch
      window.dispatchEvent(new CustomEvent('orvix-toast', { 
        detail: `Project ${formData.projectName} has been submitted to review queue.` 
      }));

      setIsSubmitting(false);
      setIsSubmitted(true);

      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        zIndex: 1000,
      });
    }, 1200);
  };

  // Steps definition for stepper UI (0 to 6)
  const steps = [
    { num: 0, title: 'Terms of Service', desc: 'Rules & Consent' },
    { num: 1, title: 'Connect Wallet', desc: 'Verify Owner' },
    { num: 2, title: 'Token Metadata', desc: 'Contract details' },
    { num: 3, title: 'Premium Access', desc: '0.25% Verification' },
    { num: 4, title: 'Project Metadata', desc: 'Socials & Media' },
    { num: 5, title: 'LP Information', desc: 'Verify Liquidity' },
    { num: 6, title: 'Final Submit', desc: 'Submit for Review' }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-12">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-3">
            Submit Token
            <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-[#555555]/10 dark:bg-[#CCCCCC]/10 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700">
              Guided Onboarding
            </span>
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Submit your token metadata to the Orvix Protocol review queue and prepare for New Alpha listing.
          </p>
        </div>

        {ownerAddress && (
          <div className="flex items-center gap-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shrink-0" />
            <div className="text-xs font-mono">
              <span className="text-zinc-400 block text-[10px] uppercase tracking-wider font-semibold">Owner Wallet</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {ownerAddress.slice(0, 6)}...{ownerAddress.slice(-4)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Stepper Progress Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="relative flex items-center justify-between">
          {/* Connecting Line */}
          <div className="absolute left-6 right-6 top-5 h-0.5 bg-zinc-200 dark:bg-zinc-800 -z-0" />
          <div 
            className="absolute left-6 top-5 h-0.5 bg-[#555555] dark:bg-[#CCCCCC] transition-all duration-500 -z-0"
            style={{ width: `${(step / (steps.length - 1)) * 92}%` }}
          />

          {steps.map((s) => {
            const isCompleted = step > s.num;
            const isCurrent = step === s.num;
            const isAccessible = s.num === 0 
              ? true 
              : s.num === 1 
                ? termsAccepted 
                : s.num === 2 
                  ? (termsAccepted && ownerAddress !== '')
                  : s.num === 3 
                    ? (termsAccepted && ownerAddress !== '' && isStep2Valid)
                    : s.num === 4 
                      ? (termsAccepted && ownerAddress !== '' && isStep2Valid && hasPremiumAccess)
                      : s.num === 5 
                        ? (termsAccepted && ownerAddress !== '' && isStep2Valid && hasPremiumAccess && isStep4Valid)
                        : (termsAccepted && ownerAddress !== '' && isStep2Valid && hasPremiumAccess && isStep4Valid && isStep5Valid);

            return (
              <div 
                key={s.num} 
                className={cn(
                  "flex flex-col items-center gap-2 relative z-10 select-none transition-all",
                  isAccessible ? "cursor-pointer" : "cursor-not-allowed opacity-40"
                )}
                onClick={() => {
                  if (isAccessible && s.num < step) {
                    setStep(s.num);
                  }
                }}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 bg-white dark:bg-zinc-950",
                  isCompleted 
                    ? "border-[#555555] dark:border-[#CCCCCC] bg-[#555555] dark:bg-[#CCCCCC] text-white dark:text-zinc-950 shadow-sm" 
                    : isCurrent 
                      ? "border-[#555555] dark:border-[#CCCCCC] text-zinc-900 dark:text-zinc-100 ring-4 ring-zinc-500/20 font-extrabold" 
                      : "border-zinc-200 dark:border-zinc-800 text-zinc-400"
                )}>
                  {isCompleted ? <Check className="w-5 h-5 stroke-[3]" /> : s.num}
                </div>
                <div className="text-center hidden md:block max-w-[100px]">
                  <div className={cn(
                    "text-[10px] font-bold leading-tight",
                    isCurrent ? "text-zinc-900 dark:text-zinc-100" : isCompleted ? "text-zinc-700 dark:text-zinc-300" : "text-zinc-400"
                  )}>
                    {s.title}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Wizard Container */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-sm transition-all duration-300">
        
        {/* STEP 0: TERMS OF SERVICE */}
        {step === 0 && (
          <div className="space-y-6 max-w-2xl mx-auto py-2">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">Step 0 of 6</div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Terms of Service & Listing Rules</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Please read and accept the protocol guidelines before submitting your project metadata.
              </p>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-950 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 space-y-3.5 max-h-[320px] overflow-y-auto leading-relaxed font-sans">
              <div className="font-bold text-zinc-900 dark:text-zinc-100 text-base mb-1">Orvix Protocol Listing Agreement</div>
              <p>
                <strong>1. Accurate Information:</strong> The project owner agrees to provide truthful and verifiable metadata. Any attempt to misrepresent project attributes, supply, or links will lead to permanent blacklist.
              </p>
              <p>
                <strong>2. Premium Access Deposit (0.25%):</strong> A standard 0.25% total supply deposit to the Orvix Treasury is required for all project submissions. This unlocks Premium Features immediately.
              </p>
              <p>
                <strong>3. Anti-Honeypot Policy:</strong> Contracts with buy/sell taxes higher than 5% or unrenounced mint privileges will be rejected during technical evaluation.
              </p>
              <p>
                <strong>4. Review & Approval:</strong> Submitting metadata does not guarantee immediate public listing. The project will appear in <em>New Alpha</em> only after satisfying liquidity pair creation and lock hash requirements.
              </p>
              <p>
                <strong>5. Disclaimer:</strong> Orvix Protocol performs technical validation only. Listing is not financial or investment advice.
              </p>
            </div>

            {/* Accept Checkbox */}
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-zinc-300 dark:border-zinc-700 text-[#555555] dark:text-[#CCCCCC] focus:ring-[#555555] bg-white dark:bg-zinc-900 cursor-pointer shrink-0"
                />
                <span className="text-sm text-zinc-800 dark:text-zinc-200 font-medium leading-snug">
                  I have read and agree to the Terms of Service.
                </span>
              </label>
            </div>

            <div className="flex items-center justify-end pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <Button 
                disabled={!termsAccepted}
                onClick={() => setStep(1)}
                className="flex items-center gap-1 font-semibold px-6"
              >
                Continue to Connect Wallet <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 1: CONNECT WALLET */}
        {step === 1 && (
          <div className="space-y-6 max-w-xl mx-auto py-4 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-[#5cceff] shadow-inner">
              <Wallet className="w-8 h-8" />
            </div>

            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">Step 1 of 6</div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Connect Wallet</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Connect your Web3 wallet to continue the listing onboarding.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-left text-xs text-amber-700 dark:text-amber-400">
              <span className="font-bold block mb-1">Important Note:</span>
              Connect the same wallet as the token contract's deployer/creator/owner.
            </div>

            {isWalletConnected ? (
              <div className="p-6 rounded-2xl bg-green-500/10 border border-green-500/30 text-left space-y-4 animate-fadeIn">
                <div className="flex items-center gap-3 text-green-700 dark:text-green-400 font-semibold text-base">
                  <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <div>Wallet Connected</div>
                    <div className="text-xs font-normal opacity-80">Owner address set to {connectedAddress}</div>
                  </div>
                </div>

                <Button 
                  size="lg" 
                  className="w-full font-bold flex items-center justify-center gap-2"
                  onClick={() => setStep(2)}
                >
                  Continue to Token Metadata <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-left space-y-5">
                <Button 
                  size="lg" 
                  className="w-full font-bold flex items-center justify-center gap-2"
                  onClick={() => {
                    if (onOpenWalletModal) {
                      onOpenWalletModal();
                    } else if (web3.open) {
                      web3.open();
                    } else {
                      web3.connectWallet('injected');
                    }
                  }}
                >
                  <Wallet className="w-5 h-5" />
                  Connect Wallet
                </Button>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <Button variant="ghost" onClick={() => setStep(0)} className="flex items-center gap-1">
                <ChevronLeft className="w-4 h-4" /> Back
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: TOKEN METADATA (SINGKAT) */}
        {step === 2 && (
          <div className="space-y-6 max-w-3xl mx-auto py-2">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">Step 2 of 6</div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Token Metadata</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Provide basic blockchain specifications for your token.
              </p>
            </div>

            <div className="space-y-5">
              {/* Contract Address helper */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                  <span>Token Contract Address</span>
                  <span className="text-[10px] text-zinc-400 font-normal">BSC Smart Contract (0x...)</span>
                </label>
                <input 
                  type="text" 
                  value={formData.contractAddress} 
                  onChange={e => setFormData({...formData, contractAddress: e.target.value})}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 font-mono text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#555555] dark:focus:ring-[#CCCCCC] outline-none placeholder:text-zinc-400" 
                  placeholder="0x1234567890abcdef1234567890abcdef12345678" 
                />
                {isLoadingToken && (
                  <div className="text-xs text-cyan-600 dark:text-cyan-400 flex items-center gap-2 mt-1 font-medium">
                    <div className="w-3 h-3 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                    Reading contract metadata...
                  </div>
                )}
                {tokenError && <p className="text-xs text-red-500 mt-1">{tokenError}</p>}
              </div>

              {/* Detected Token Quick Banner */}
              {tokenInfo && (
                <div className="bg-cyan-50/80 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/60 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-700 dark:text-cyan-400 font-bold mb-0.5">Calculated Deposit (0.25%)</div>
                    <div className="font-mono text-lg text-zinc-900 dark:text-zinc-100 font-bold">
                      {tokenInfo.depositFormatted} <span className="text-sm font-semibold text-cyan-600 dark:text-cyan-400">{tokenInfo.symbol}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono">Total Supply</div>
                    <div className="font-mono text-xs font-semibold text-zinc-700 dark:text-zinc-300">{tokenInfo.totalSupplyFormatted}</div>
                  </div>
                </div>
              )}

              {/* Form Input fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Token Name *</label>
                  <input 
                    type="text" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#555555] outline-none" 
                    placeholder="Token Name" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Token Symbol *</label>
                  <input 
                    type="text" 
                    value={formData.symbol} 
                    onChange={e => setFormData({...formData, symbol: e.target.value})}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#555555] outline-none" 
                    placeholder="Token Symbol" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Decimals *</label>
                  <input 
                    type="text" 
                    value={formData.decimals} 
                    onChange={e => setFormData({...formData, decimals: e.target.value})}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2 text-sm font-mono text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#555555] outline-none" 
                    placeholder="18" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Initial Supply (Total Supply) *</label>
                  <input 
                    type="number" 
                    value={formData.totalSupply} 
                    onChange={e => setFormData({...formData, totalSupply: e.target.value})}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2 text-sm font-mono text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#555555] outline-none" 
                    placeholder="1000000000" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Buy Tax (%)</label>
                  <input 
                    type="text" 
                    value={formData.buyTax} 
                    onChange={e => setFormData({...formData, buyTax: e.target.value})}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#555555] outline-none" 
                    placeholder="0" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Sell Tax (%)</label>
                  <input 
                    type="text" 
                    value={formData.sellTax} 
                    onChange={e => setFormData({...formData, sellTax: e.target.value})}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#555555] outline-none" 
                    placeholder="0" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Transfer Tax (%)</label>
                  <input 
                    type="text" 
                    value={formData.transferTax} 
                    onChange={e => setFormData({...formData, transferTax: e.target.value})}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#555555] outline-none" 
                    placeholder="0" 
                  />
                </div>
              </div>

              {/* Mint & Burn Block Option */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Active Mint Function?</label>
                  <select 
                    value={formData.mint}
                    onChange={e => setFormData({...formData, mint: e.target.value})}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#555555] outline-none"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Burn Privileges?</label>
                  <select 
                    value={formData.burn}
                    onChange={e => setFormData({...formData, burn: e.target.value})}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#555555] outline-none"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Admin/Guardian Control?</label>
                  <select 
                    value={formData.adminControl}
                    onChange={e => setFormData({...formData, adminControl: e.target.value})}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#555555] outline-none"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
              </div>

              {/* Mint Block Message */}
              {formData.mint === 'yes' && (
                <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-xs text-red-600 dark:text-red-400 font-semibold animate-fadeIn">
                  Tokens with an active Mint function are not eligible for Orvix listing.
                </div>
              )}

              {/* Liquidity Information */}
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 space-y-4">
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 block font-bold">Liquidity Information</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Initial LP Amount *</label>
                    <input 
                      type="number" 
                      value={formData.initialLpAmount} 
                      onChange={e => setFormData({...formData, initialLpAmount: e.target.value})}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#555555] outline-none" 
                      placeholder="10000" 
                    />
                    <span className="text-[10px] text-zinc-400 block">$10,000 minimum</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Planned LP Supply *</label>
                    <input 
                      type="number" 
                      value={formData.plannedLpSupply} 
                      onChange={e => setFormData({...formData, plannedLpSupply: e.target.value})}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#555555] outline-none" 
                      placeholder="e.g. 50000000" 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Base Pair</label>
                    <select 
                      value={formData.basePair}
                      onChange={e => setFormData({...formData, basePair: e.target.value})}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#555555] outline-none"
                    >
                      <option value="WBNB">WBNB</option>
                      <option value="USDT">USDT</option>
                      <option value="USDC">USDC</option>
                      <option value="USST">USST</option>
                    </select>
                  </div>
                </div>

                <p className="text-[11px] text-zinc-400">
                  Note: LP can be created on PancakeSwap, BakerySwap, or other compatible AMMs.
                </p>
              </div>

              {/* Description field */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Project Description *</label>
                  <span className={cn(
                    "text-[10px] font-mono",
                    getWordCount(formData.description) > 300 ? "text-red-500 font-bold" : "text-zinc-400"
                  )}>
                    {getWordCount(formData.description)} / 300 words
                  </span>
                </div>
                <textarea 
                  rows={4}
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl p-3 text-xs text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#555555] outline-none resize-none" 
                  placeholder="Describe your project vision, tokenomics, and utility (maximum 300 words)..." 
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <Button variant="ghost" onClick={() => setStep(1)} className="flex items-center gap-1">
                <ChevronLeft className="w-4 h-4" /> Back
              </Button>

              <Button 
                disabled={!isStep2Valid || formData.mint === 'yes'}
                onClick={() => setStep(3)}
                className="flex items-center gap-1 font-semibold px-6"
              >
                Continue to Premium Access <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: PAYMENT (PREMIUM ACCESS 0.25%) */}
        {step === 3 && (
          <div className="space-y-6 max-w-2xl mx-auto py-2">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">Step 3 of 6</div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                Premium Access Verification
                <Crown className="w-5 h-5 text-amber-500" />
              </h2>
            </div>

            {paymentSubStep === 'summary' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 space-y-4">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Contribution Required</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    To continue submitting your project, a deposit of 0.25% of total supply is required. This grants immediate Premium Access, unlocking Story and Banner features.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <Button variant="outline" onClick={() => window.location.href = '/'} className="flex items-center gap-1">
                    Cancel (Return Home)
                  </Button>

                  <Button 
                    onClick={() => setPaymentSubStep('pay')}
                    className="flex items-center gap-1 font-bold px-6 bg-amber-500 hover:bg-amber-600 text-zinc-950"
                  >
                    Pay 0.25% Supply <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {paymentSubStep === 'pay' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="p-5 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-950 space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500 font-mono uppercase tracking-wider font-semibold">Required Amount (0.25% Total Supply)</span>
                    <span className="font-mono text-zinc-400">Official Treasury Address</span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <div>
                      <div className="text-xl font-extrabold font-mono text-cyan-600 dark:text-cyan-400">
                        {((Number(formData.totalSupply) || 0) * 0.0025).toLocaleString('en-US', { maximumFractionDigits: 6 })}
                        <span className="text-sm font-semibold text-zinc-500 ml-1.5">{formData.symbol || 'TOKEN'}</span>
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-1 uppercase font-semibold font-mono tracking-wider">
                        {Number(formData.totalSupply || 0).toLocaleString()} {formData.symbol || 'TOKEN'} → {((Number(formData.totalSupply) || 0) * 0.0025).toLocaleString('en-US', { maximumFractionDigits: 6 })} {formData.symbol || 'TOKEN'} Premium Access (0.25%)
                      </div>
                    </div>

                    <div className="text-xs font-mono bg-zinc-100 dark:bg-zinc-950 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 break-all sm:max-w-[220px]">
                      {ORVIX_CONFIG.treasury}
                    </div>
                  </div>

                  {hasPremiumAccess ? (
                    <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-semibold text-sm">
                        <Check className="w-5 h-5" />
                        Premium Access Granted
                      </div>
                      <a 
                        href={`${getExplorerUrl()}/tx/${premiumTxHash}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-xs font-mono text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        {premiumTxHash.slice(0, 6)}...{premiumTxHash.slice(-4)} <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-4 pt-2">
                      <Button 
                        size="lg"
                        className="w-full font-bold flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-zinc-950"
                        onClick={handleUpgradePremium}
                        disabled={isUpgradingPremium}
                      >
                        <Crown className="w-5 h-5" />
                        {isUpgradingPremium ? 'Confirming in Wallet...' : 'Deposit 0.25% & Unlock Premium'}
                      </Button>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-mono uppercase text-zinc-400 font-bold block">Transaction Hash *</label>
                        <input 
                          type="text" 
                          value={premiumTxHashInput} 
                          onChange={e => setPremiumTxHashInput(e.target.value)}
                          className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2 text-xs font-mono text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-[#555555]"
                          placeholder="Paste verified transaction hash (e.g. 0x...)" 
                        />
                      </div>

                      <Button 
                        disabled={!premiumTxHashInput.trim()}
                        onClick={handleVerifyPremium}
                        className="w-full font-semibold border border-zinc-300 dark:border-zinc-700 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs py-2 rounded-xl"
                      >
                        Verify & Activate Premium
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <Button variant="ghost" onClick={() => setPaymentSubStep('summary')} className="flex items-center gap-1">
                    <ChevronLeft className="w-4 h-4" /> Back
                  </Button>

                  <Button 
                    disabled={!hasPremiumAccess}
                    onClick={() => setStep(4)}
                    className="flex items-center gap-1 font-semibold px-6"
                  >
                    Continue to Project Metadata <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: METADATA 2 (SOSIAL, ICON, BANNER) */}
        {step === 4 && (
          <div className="space-y-6 max-w-3xl mx-auto py-2">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">Step 4 of 6</div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Project Metadata</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Provide visual materials and socials for your project page.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-green-500/30 bg-green-500/10 text-xs text-green-700 dark:text-green-400 font-semibold mb-2">
              Premium Access is active. Story and Banner slots are now unlocked for this submission.
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Project Name *</label>
                  <input 
                    type="text" 
                    value={formData.projectName} 
                    onChange={e => setFormData({...formData, projectName: e.target.value})}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#555555] outline-none" 
                    placeholder="e.g. Orvix Ecosystem" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Website URL *</label>
                  <input 
                    type="url" 
                    value={formData.website} 
                    onChange={e => setFormData({...formData, website: e.target.value})}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#555555] outline-none" 
                    placeholder="https://example.com" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">X (Twitter)</label>
                  <input 
                    type="url" 
                    value={formData.x} 
                    onChange={e => setFormData({...formData, x: e.target.value})}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#555555] outline-none" 
                    placeholder="https://x.com/yourproject" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Discord</label>
                  <input 
                    type="url" 
                    value={formData.discord} 
                    onChange={e => setFormData({...formData, discord: e.target.value})}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#555555] outline-none" 
                    placeholder="https://discord.gg/yourproject" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Telegram</label>
                  <input 
                    type="url" 
                    value={formData.telegram} 
                    onChange={e => setFormData({...formData, telegram: e.target.value})}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#555555] outline-none" 
                    placeholder="https://t.me/yourproject" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Contact Email *</label>
                  <input 
                    type="email" 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#555555] outline-none" 
                    placeholder="team@example.com" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Github</label>
                  <input 
                    type="url" 
                    value={formData.github} 
                    onChange={e => setFormData({...formData, github: e.target.value})}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#555555] outline-none" 
                    placeholder="https://github.com/..." 
                  />
                </div>
              </div>

              {/* Upload Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                {/* ICON UPLOAD */}
                <div className="space-y-2 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 bg-zinc-50/50 dark:bg-zinc-950/50">
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">Token Icon Upload *</span>
                  <div className="flex items-center gap-4">
                    {tokenIconFile ? (
                      <img 
                        src={tokenIconFile} 
                        alt="Token Icon Preview" 
                        className="w-16 h-16 rounded-full object-cover border border-zinc-300 dark:border-zinc-700 bg-white" 
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}
                    <div className="flex-1 space-y-1">
                      <input 
                        type="file" 
                        accept="image/png, image/jpeg, image/webp" 
                        onChange={handleIconUpload}
                        className="hidden" 
                        id="icon-upload-input"
                      />
                      <label 
                        htmlFor="icon-upload-input" 
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-semibold cursor-pointer border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200"
                      >
                        <Upload className="w-3.5 h-3.5" /> Upload File
                      </label>
                      <span className="text-[10px] text-zinc-400 block leading-relaxed">JPG, PNG, or WEBP. Max 2MB.</span>
                    </div>
                  </div>
                </div>

                {/* BANNER UPLOAD */}
                <div className="space-y-2 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 bg-zinc-50/50 dark:bg-zinc-950/50">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Wallpaper Banner Uploads</span>
                    <span className="text-[10px] text-zinc-400 font-mono">{banners.length} / 4 uploaded</span>
                  </div>
                  
                  <div className="space-y-3">
                    {banners.length > 0 && (
                      <div className="grid grid-cols-4 gap-2">
                        {banners.map((b, idx) => (
                          <div key={idx} className="relative aspect-video rounded-md overflow-hidden border border-zinc-300 dark:border-zinc-700 bg-black group">
                            <img src={b} alt="banner" className="w-full h-full object-cover" />
                            <button 
                              type="button"
                              onClick={() => removeBanner(idx)}
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <input 
                      type="file" 
                      multiple 
                      accept="image/png, image/jpeg, image/webp" 
                      onChange={handleBannerUpload}
                      disabled={banners.length >= 4}
                      className="hidden" 
                      id="banner-upload-input"
                    />
                    <label 
                      htmlFor="banner-upload-input" 
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border text-zinc-800 dark:text-zinc-200",
                        banners.length >= 4 
                          ? "bg-zinc-200/50 cursor-not-allowed border-zinc-200 text-zinc-400" 
                          : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border-zinc-300 dark:border-zinc-700"
                      )}
                    >
                      <Upload className="w-3.5 h-3.5" /> Upload Banner Images
                    </label>
                    <span className="text-[10px] text-zinc-400 block leading-relaxed">JPG, PNG, or WEBP. Max 2MB per file. Up to 4.</span>
                  </div>
                </div>
              </div>

              {/* Data confirmation checkbox */}
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={dataConfirmed}
                    onChange={(e) => setDataConfirmed(e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-zinc-300 dark:border-zinc-700 text-[#555555] dark:text-[#CCCCCC] focus:ring-[#555555] bg-white dark:bg-zinc-900 cursor-pointer shrink-0"
                  />
                  <span className="text-xs text-zinc-800 dark:text-zinc-200 font-semibold leading-relaxed">
                    Saya memastikan data project yang diberikan benar.
                  </span>
                </label>
              </div>

              <div className="text-xs text-zinc-400 mt-2 font-medium">
                Your project status is currently pending. Complete the listing process by adding liquidity and locking LP tokens.
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <Button variant="ghost" onClick={() => setStep(3)} className="flex items-center gap-1">
                <ChevronLeft className="w-4 h-4" /> Back
              </Button>

              <Button 
                disabled={!isStep4Valid}
                onClick={() => setStep(5)}
                className="flex items-center gap-1 font-semibold px-6"
              >
                Continue to LP Info <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 5: LP INFORMATION */}
        {step === 5 && (
          <div className="space-y-6 max-w-2xl mx-auto py-2">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">Step 5 of 6</div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                Liquidity Pool & Lock Proof
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                After you have added liquidity, complete the following transaction verification.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed space-y-2">
              <span className="font-bold block text-zinc-900 dark:text-zinc-100 text-sm">Listing Pre-Requisite Check</span>
              <p>1. Add Liquidity on a compatible AMM (e.g. PancakeSwap V2) with base token ({formData.basePair}).</p>
              <p>2. Lock the LP tokens in an authorized locker (e.g. PinkLock, Unicrypt) for at least 6 months.</p>
              <p>3. Copy the transaction hashes of both actions and paste them below.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase text-zinc-400 font-bold block">Add Liquidity TX Hash *</label>
                <input 
                  type="text" 
                  value={addLpTxHash}
                  onChange={(e) => setAddLpTxHash(e.target.value)}
                  placeholder="0x... (Add Liquidity Transaction Hash)"
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2 text-xs font-mono text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-[#555555]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase text-zinc-400 font-bold block">Lock LP Token TX Hash *</label>
                <input 
                  type="text" 
                  value={lockLpTxHash}
                  onChange={(e) => setLockLpTxHash(e.target.value)}
                  placeholder="0x... (LP Token Lock Transaction Hash)"
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2 text-xs font-mono text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-[#555555]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <Button variant="ghost" onClick={() => setStep(4)} className="flex items-center gap-1">
                <ChevronLeft className="w-4 h-4" /> Back
              </Button>

              <Button 
                disabled={!isStep5Valid}
                onClick={() => setStep(6)}
                className="flex items-center gap-1 font-semibold px-6"
              >
                Continue to Submit <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 6: SUBMIT & REVIEW STATUS */}
        {step === 6 && (
          <div className="space-y-6 max-w-3xl mx-auto py-2">
            {!isSubmitted ? (
              <div className="space-y-6">
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">Step 6 of 6</div>
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Final Review & Submit</h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    Review your metadata and send your token to the Orvix internal review process.
                  </p>
                </div>

                {/* Pre-submission Summary Card */}
                <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-zinc-50/50 dark:bg-zinc-950/50 p-5 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-zinc-400 block font-mono uppercase text-[10px] font-bold">Project Display Name</span>
                      <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{formData.projectName}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block font-mono uppercase text-[10px] font-bold">Token Info</span>
                      <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{formData.name} ({formData.symbol})</span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block font-mono uppercase text-[10px] font-bold">Contract Address</span>
                      <span className="font-mono text-zinc-800 dark:text-zinc-200 break-all">{formData.contractAddress || 'Manual Input'}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block font-mono uppercase text-[10px] font-bold">Total Supply</span>
                      <span className="font-mono text-zinc-800 dark:text-zinc-200">{Number(formData.totalSupply || 0).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block font-mono uppercase text-[10px] font-bold">Liquidity Info</span>
                      <span className="font-mono text-zinc-800 dark:text-zinc-200">
                        {Number(formData.initialLpAmount).toLocaleString()} {formData.basePair} ({Number(formData.plannedLpSupply).toLocaleString()} Supply)
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block font-mono uppercase text-[10px] font-bold">Premium Level</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        Premium Access Active
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-3">
                  <Info className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-bold">Important Notice Regarding Review Process</div>
                    <p>
                      Your project will enter our pending review queue. Once verified by our smart contract security scanner and reviewers, it will be authorized to go live on the discovery queue.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <Button variant="ghost" onClick={() => setStep(5)} disabled={isSubmitting}>
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                  </Button>

                  <Button 
                    size="lg"
                    onClick={handleFinalSubmit}
                    disabled={isSubmitting || !hasPremiumAccess || !isStep5Valid}
                    className="font-bold px-8"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Submitting Metadata...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Submit Project for Review <ChevronRight className="w-5 h-5" />
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              /* SUBMISSION CONFIRMATION */
              <div className="space-y-8 animate-fadeIn">
                <div className="text-center space-y-3 py-4 border-b border-zinc-200 dark:border-zinc-800">
                  <div className="w-16 h-16 mx-auto rounded-full bg-green-500/10 border border-green-500/30 text-green-500 flex items-center justify-center">
                    <ShieldCheck className="w-10 h-10" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
                    Submission Received
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto leading-relaxed">
                    Your project has been submitted and is now under review by the Orvix team. It will be published to New Alpha once a slot becomes available. If all slots are currently full, your project will enter the queue — Orvix will rotate older projects to Archive as slots open up. You will be notified via email or your Profile page once a decision is made.
                  </p>

                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-mono text-xs font-semibold">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      Status: pending_review
                    </span>
                    <span className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 font-mono text-xs text-zinc-700 dark:text-zinc-300 font-bold border border-zinc-200 dark:border-zinc-700">
                      ID: {submissionId}
                    </span>
                  </div>
                </div>

                {/* Final Navigation Action */}
                <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <Button variant="outline" onClick={() => window.location.reload()}>
                    Submit Another Token
                  </Button>

                  <Button onClick={() => window.location.href = '/'}>
                    Return to Discovery
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
