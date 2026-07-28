import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useWeb3 } from '../lib/web3';
import { Page, Token } from '../types';
import { Wallet, Copy, Check, LogOut, TrendingUp, ShieldAlert, Pencil } from 'lucide-react';
import { Button } from '../components/Button';
import { formatGlobalNumber } from '../lib/formatNumber';
import { useAlphaData } from '../hooks/useAlphaData';
import { ethers } from 'ethers';

const REFERENCE_TOKENS: Token[] = [
  {
    id: 'ref-usdt',
    name: 'Tether USD',
    symbol: 'USDT',
    pair: 'USDT/BNB',
    chain: 'BEP-20',
    price: '1.00',
    priceChange: 0,
    listedAt: 'Genesis',
    contract: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd',
    creator: '0x0000...0000',
    addLpTx: '', renounceTx: '', lockLpTx: '', ammVersion: 'AMM V2', totalSupply: '100,000,000',
    logo: 'https://assets.coingecko.com/coins/images/325/small/Tether.png'
  },
  {
    id: 'ref-usst',
    name: 'USST Token',
    symbol: 'USST',
    pair: 'USST/BNB',
    chain: 'BEP-20',
    price: '1.40',
    priceChange: 8.12,
    listedAt: 'Genesis',
    contract: '0x0b826aFC12380Cd138ED9e7211631033fa51716F',
    creator: '0x0000...0000',
    addLpTx: '', renounceTx: '', lockLpTx: '', ammVersion: 'AMM V2', totalSupply: '100,000,000',
    logo: 'https://assets.coingecko.com/coins/images/325/small/Tether.png'
  },
  {
    id: 'ref-wbnb',
    name: 'Wrapped BNB',
    symbol: 'WBNB',
    pair: 'WBNB/USDT',
    chain: 'BEP-20',
    price: '567.27',
    priceChange: 2.45,
    listedAt: 'Genesis',
    contract: '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd',
    creator: '0x0000...0000',
    addLpTx: '', renounceTx: '', lockLpTx: '', ammVersion: 'AMM V2', totalSupply: '10,000,000',
    logo: 'https://assets.coingecko.com/coins/images/12591/small/binance-coin-logo.png'
  },
  {
    id: 'ref-usd',
    name: '$USD Token',
    symbol: '$USD',
    pair: '$USD/BNB',
    chain: 'BEP-20',
    price: '1.00',
    priceChange: -0.05,
    listedAt: 'Genesis',
    contract: '0xBCf4FBE06fe75c4B95F393918Ed53dD9A18d3b95',
    creator: '0x0000...0000',
    addLpTx: '', renounceTx: '', lockLpTx: '', ammVersion: 'AMM V2', totalSupply: '100,000,000',
    logo: 'https://picsum.photos/seed/usd/200/200'
  },
  {
    id: 'ref-fedv',
    name: 'FEDV Token',
    symbol: 'FEDV',
    pair: 'FEDV/BNB',
    chain: 'BEP-20',
    price: '0.85',
    priceChange: 4.12,
    listedAt: 'Genesis',
    contract: '0x2eB17E7c7F73315DDf8eB4b388931f7f10A8278a',
    creator: '0x0000...0000',
    addLpTx: '', renounceTx: '', lockLpTx: '', ammVersion: 'AMM V2', totalSupply: '100,000,000',
    logo: 'https://picsum.photos/seed/fedv/200/200'
  },
  {
    id: 'ref-orx',
    name: 'Orvix Protocol Token',
    symbol: 'ORX',
    pair: 'ORX/USDT',
    chain: 'BEP-20',
    price: '0.052',
    priceChange: -1.24,
    listedAt: 'Genesis',
    contract: '0x3b29a13d9fcd40f28c548b501c67ec48',
    creator: '0x0000...0000',
    addLpTx: '', renounceTx: '', lockLpTx: '', ammVersion: 'AMM V2', totalSupply: '1,000,000,000',
    logo: 'https://picsum.photos/seed/orvix/200/200'
  }
];

export function ProfilePage({
  setCurrentPage,
  onSelectToken,
  onTrade
}: {
  setCurrentPage: (p: Page) => void;
  onSelectToken: (t: Token) => void;
  onTrade?: (t: Token) => void;
}) {
  const {
    address,
    isConnected,
    formattedBalance,
    balanceInUsd,
    symbol,
    open: openWallet,
    disconnect,
    provider
  } = useWeb3();

  // Load and save custom profile name
  const [profileName, setProfileName] = useState(() => {
    return localStorage.getItem('orvix_profile_name') || 'Orvix Explorer';
  });
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');

  const [copied, setCopied] = useState(false);
  const [chartDot, setChartDot] = useState<{ cx: number; cy: number }>({ cx: 280, cy: 75 });
  const [tooltipData, setTooltipData] = useState({ show: false, x: 0, price: '' });

  // Get active tokens from useAlphaData
  const { tokens: alphaTokens } = useAlphaData();

  // Combine user submissions + mock tokens with our on-chain reference tokens
  const tokens = React.useMemo(() => {
    const combined = [...alphaTokens];
    for (const refToken of REFERENCE_TOKENS) {
      if (!combined.some(t => t.contract?.toLowerCase() === refToken.contract.toLowerCase())) {
        combined.push(refToken);
      }
    }
    return combined;
  }, [alphaTokens]);

  const [realBalances, setRealBalances] = useState<Record<string, { balance: number; value: number }>>({});
  const [loadingBalances, setLoadingBalances] = useState(false);

  // Fetch real ERC20 balances for active tokens when wallet is connected
  useEffect(() => {
    let isMounted = true;
    async function fetchBalances() {
      if (!isConnected || !address || !provider) return;
      setLoadingBalances(true);
      
      const balances: Record<string, { balance: number; value: number }> = {};
      const bnbPrice = formattedBalance && formattedBalance > 0 ? (Number(balanceInUsd) / formattedBalance) : 567.27;
      
      for (const token of tokens) {
        try {
          if (!token.contract || !token.contract.startsWith('0x') || token.contract === '0x0000000000000000000000000000000000000000') {
            continue;
          }
          const erc20 = new ethers.Contract(
            token.contract,
            [
              "function balanceOf(address) view returns (uint256)",
              "function decimals() view returns (uint8)"
            ],
            provider
          );
          
          const [balRaw, decimalsRaw] = await Promise.all([
            erc20.balanceOf(address).catch(() => 0n),
            erc20.decimals().catch(() => 18)
          ]);
          
          const decimals = Number(decimalsRaw) || 18;
          const balanceNum = Number(ethers.formatUnits(balRaw, decimals));
          const priceNum = token.symbol === 'WBNB' ? bnbPrice : (parseFloat(token.price) || 0);
          const valNum = balanceNum * priceNum;
          
          balances[token.id] = {
            balance: balanceNum,
            value: valNum
          };
        } catch (e) {
          console.error(`Error fetching balance for token ${token.symbol}:`, e);
        }
      }
      
      if (isMounted) {
        setRealBalances(balances);
        setLoadingBalances(false);
      }
    }
    
    fetchBalances();
    const interval = setInterval(fetchBalances, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isConnected, address, provider, tokens, formattedBalance, balanceInUsd]);

  // Copy wallet address
  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      const event = new CustomEvent('orvix-toast', {
        detail: 'Wallet address copied to clipboard!'
      });
      window.dispatchEvent(event);
    }
  };

  // Save edited profile name
  const handleSaveName = () => {
    const trimmed = tempName.trim();
    if (trimmed) {
      setProfileName(trimmed);
      localStorage.setItem('orvix_profile_name', trimmed);
    }
    setIsEditingName(false);
  };

  // Calculate real balances combined
  const bnbVal = formattedBalance || 0;
  const bnbUsd = Number(balanceInUsd) || 0;
  const bnbPrice = bnbVal > 0 ? (bnbUsd / bnbVal) : 567.27;

  const tokensUsd = Object.entries(realBalances).reduce((acc, [tokenId, b]) => {
    const t = tokens.find(tok => tok.id === tokenId);
    let price = t ? parseFloat(t.price) || 0 : 0;
    if (t?.symbol === 'WBNB') {
      price = bnbPrice;
    }
    return acc + (b.balance * price);
  }, 0);
  const totalPortfolioValue = isConnected ? (bnbUsd + tokensUsd) : 0;

  // Build the list of active holdings
  const holdingsList = [
    // Native BNB
    {
      id: 'bnb',
      name: 'Binance Coin',
      symbol: symbol || 'BNB',
      logo: 'https://assets.coingecko.com/coins/images/825/standard/bnb-icon2_2x.png',
      balance: bnbVal,
      price: bnbPrice,
      value: bnbUsd,
      priceChange24h: 2.45,
      isNative: true,
      contract: 'Native',
      tokenObj: undefined
    },
    // Map other active tokens
    ...tokens.map(token => {
      const tokenBalInfo = realBalances[token.id] || { balance: 0, value: 0 };
      let price = parseFloat(token.price) || 0;
      if (token.symbol === 'WBNB') {
        price = bnbPrice;
      }
      return {
        id: token.id,
        name: token.name,
        symbol: token.symbol,
        logo: token.logo || `https://picsum.photos/seed/${token.symbol}/200/200`,
        balance: tokenBalInfo.balance,
        price: price,
        value: tokenBalInfo.balance * price,
        priceChange24h: token.priceChange || 0,
        isNative: false,
        contract: token.contract,
        tokenObj: token
      };
    })
  ];

  // Handle asset click to Trade Now
  const handleAssetClick = (tokenObj?: Token) => {
    if (tokenObj) {
      if (onTrade) {
        onTrade(tokenObj);
      } else {
        onSelectToken(tokenObj);
        setCurrentPage('SWAP');
      }
    } else {
      // If native BNB, navigate to SWAP directly
      setCurrentPage('SWAP');
    }
    const event = new CustomEvent('orvix-toast', {
      detail: `Navigating to trade page...`
    });
    window.dispatchEvent(event);
  };

  // Interactive portfolio line chart hover
  const handleChartClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pctX = x / rect.width;
    const chartWidth = 340;
    const cx = pctX * chartWidth;
    
    // Approximate curve points
    let cy = 110;
    if (cx < 60) {
      cy = 155 - (cx / 60) * 25;
    } else if (cx < 120) {
      cy = 130 + ((cx - 60) / 60) * 5;
    } else if (cx < 180) {
      cy = 135 - ((cx - 120) / 60) * 65;
    } else if (cx < 240) {
      cy = 70 + ((cx - 180) / 60) * 25;
    } else if (cx < 290) {
      cy = 95 + ((cx - 240) / 50) * 5;
    } else {
      cy = 100 - ((cx - 290) / 50) * 40;
    }

    setChartDot({ cx, cy });
    
    // Show tooltip showing value change
    const pctValue = 0.95 + (180 - cy) / 180 * 0.1;
    const valueStr = `$${(totalPortfolioValue * pctValue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    
    setTooltipData({
      show: true,
      x: x,
      price: valueStr
    });
  };

  // Render Disconnected State
  if (!isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-xl mx-auto py-16 px-4 text-center flex flex-col items-center justify-center min-h-[450px]"
      >
        <Wallet className="w-16 h-16 text-zinc-400 dark:text-zinc-600 mb-6 stroke-[1.5]" />
        <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-100 mb-3">
          Profile & Portfolio
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mb-8 leading-relaxed">
          Please connect your Web3 wallet to access your custom profile, analyze your dApp portfolio value, and manage your digital asset allocation on the BNB Chain.
        </p>
        <Button
          variant="primary"
          onClick={openWallet}
          className="rounded-full px-8 py-3.5 font-bold uppercase tracking-widest text-xs shadow-md shadow-zinc-950/10 dark:shadow-none hover:scale-105 transition-transform"
        >
          Connect Wallet
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-5xl mx-auto py-6 sm:py-10 px-4 md:px-6 space-y-10 text-black dark:text-white font-['Inter']"
    >
      {/* Upper Section: Cover Banner & Profile info */}
      <div className="space-y-4">
        {/* Cover Banner Image */}
        <div className="relative w-full h-36 sm:h-48 overflow-hidden bg-gradient-to-br from-zinc-200 via-zinc-100 to-zinc-200 dark:from-[#0a1a2e] dark:via-[#081525] dark:to-[#050b14] rounded-2xl">
          <img 
            src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=1200&auto=format&fit=crop" 
            alt="Profile Cover" 
            className="w-full h-full object-cover opacity-60 dark:opacity-40"
          />
        </div>

        {/* Profile Avatar & Interactive Edit Name */}
        <div className="relative -mt-10 sm:-mt-14 px-2 flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full border-4 border-white dark:border-[#050607] bg-zinc-100 dark:bg-zinc-900 overflow-hidden shadow-md flex items-center justify-center shrink-0">
            <img 
              src={`https://api.dicebear.com/7.x/identicon/svg?seed=${address || 'orvix'}`} 
              alt="Profile Avatar" 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="mb-1 space-y-1 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={tempName} 
                    onChange={e => setTempName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleSaveName();
                      if (e.key === 'Escape') setIsEditingName(false);
                    }}
                    className="px-2.5 py-1 text-base font-bold rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    maxLength={20}
                    autoFocus
                  />
                  <button 
                    onClick={handleSaveName}
                    className="p-1 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white transition-colors cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <h1 className="text-xl sm:text-2xl font-black text-black dark:text-white">
                    {profileName}
                  </h1>
                  <button 
                    onClick={() => {
                      setTempName(profileName);
                      setIsEditingName(true);
                    }}
                    className="p-1 text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                    aria-label="Edit Profile Name"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
            
            {/* Wallet Address & Network info */}
            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 flex-wrap">
              <span className="font-mono font-bold">
                {address ? `${address.substring(0, 10)}...${address.substring(address.length - 8)}` : ''}
              </span>
              <button 
                onClick={handleCopy}
                className="p-1 hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-400 hover:text-black dark:hover:text-white transition-colors rounded cursor-pointer"
                title="Copy wallet address"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <span className="text-zinc-300 dark:text-zinc-700">|</span>
              <span className="font-extrabold uppercase tracking-widest text-[9px] text-yellow-600 dark:text-yellow-400">
                BNB Smart Chain Testnet
              </span>
            </div>
          </div>

          <div className="pt-2 sm:pt-0">
            <button
              onClick={() => {
                disconnect();
                const event = new CustomEvent('orvix-toast', { detail: 'Wallet disconnected.' });
                window.dispatchEvent(event);
              }}
              className="px-4 py-2 border border-red-500/20 rounded-xl text-xs font-bold uppercase tracking-wider text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              Disconnect Wallet
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Total Portfolio Balance & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
        {/* Total portfolio overview and chart */}
        <div className="lg:col-span-2 space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 dark:text-zinc-500">
              Total Portfolio Value
            </span>
            <div className="flex items-baseline gap-2">
              <h2 className="text-4xl sm:text-5xl font-black font-mono text-black dark:text-white tracking-tight">
                ${totalPortfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                <TrendingUp className="w-3.5 h-3.5" />
                +2.45% (24h)
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Estimated total combined asset value detected in your active wallet address.
            </p>
          </div>

          {/* Line Chart Canvas (no border/box container) */}
          <div className="w-full">
            <div 
              className="chart-container relative w-full bg-zinc-100/20 dark:bg-zinc-900/40 rounded-2xl py-2 px-1 min-h-[160px] cursor-crosshair select-none"
              onClick={handleChartClick}
            >
              {/* Interactive Tooltip */}
              {tooltipData.show && (
                <div 
                  className="absolute bg-zinc-900 text-white dark:bg-black border border-zinc-700 dark:border-white/20 text-[10px] px-2.5 py-1 rounded-md -top-2 -translate-x-1/2 whitespace-nowrap pointer-events-none shadow-xl z-20 font-mono"
                  style={{ left: `${tooltipData.x}px` }}
                >
                  Active Balance Change<br />
                  <span className="price font-bold text-cyan-500 dark:text-cyan-400">{tooltipData.price}</span>
                </div>
              )}

              <svg viewBox="0 0 340 180" preserveAspectRatio="none" className="block w-full h-auto">
                {/* Horizontal Gridlines */}
                <line x1="0" y1="45" x2="340" y2="45" stroke="currentColor" className="text-zinc-200 dark:text-white/5" strokeWidth="0.5" />
                <line x1="0" y1="90" x2="340" y2="90" stroke="currentColor" className="text-zinc-200 dark:text-white/5" strokeWidth="0.5" />
                <line x1="0" y1="135" x2="340" y2="135" stroke="currentColor" className="text-zinc-200 dark:text-white/5" strokeWidth="0.5" />
                
                {/* Vertical Gridlines */}
                <line x1="68" y1="0" x2="68" y2="180" stroke="currentColor" className="text-zinc-200 dark:text-white/5" strokeWidth="0.5" />
                <line x1="136" y1="0" x2="136" y2="180" stroke="currentColor" className="text-zinc-200 dark:text-white/5" strokeWidth="0.5" />
                <line x1="204" y1="0" x2="204" y2="180" stroke="currentColor" className="text-zinc-200 dark:text-white/5" strokeWidth="0.5" />
                <line x1="272" y1="0" x2="272" y2="180" stroke="currentColor" className="text-zinc-200 dark:text-white/5" strokeWidth="0.5" />
                
                <defs>
                  <linearGradient id="profileChartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                  </linearGradient>
                </defs>
                
                {/* Area fill */}
                <path d="M0,155 Q60,130 120,135 Q180,70 240,95 Q290,100 340,60 L340,180 L0,180 Z" fill="url(#profileChartGradient)" />
                
                {/* Line chart */}
                <path d="M0,155 Q60,130 120,135 Q180,70 240,95 Q290,100 340,60" fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" />
                
                {/* Dot marker */}
                <circle cx={chartDot.cx} cy={chartDot.cy} r="3" fill="#06b6d4" />
                <circle cx={chartDot.cx} cy={chartDot.cy} r="6" fill="rgba(6,182,212,0.2)" />
              </svg>
            </div>
          </div>
        </div>

        {/* Right Info: Allocation & Security alert (no outer box) */}
        <div className="lg:col-span-1 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 dark:text-zinc-500 block">
              Asset Allocation
            </span>
            <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-900/50 flex rounded-full overflow-hidden">
              {holdingsList.map((h, i) => {
                const percentage = totalPortfolioValue > 0 ? (h.value / totalPortfolioValue) * 100 : 0;
                if (percentage === 0) return null;
                const bgColors = [
                  'bg-yellow-500', // BNB
                  'bg-cyan-500',   // BTS
                  'bg-purple-500', // ORX
                  'bg-emerald-500' // USDT
                ];
                return (
                  <div
                    key={h.id}
                    style={{ width: `${percentage}%` }}
                    className={`${bgColors[i % bgColors.length]} h-full`}
                    title={`${h.symbol}: ${percentage.toFixed(1)}%`}
                  />
                );
              })}
            </div>

            {/* Allocation Legend */}
            <div className="flex flex-col gap-2">
              {holdingsList.map((h, i) => {
                const percentage = totalPortfolioValue > 0 ? (h.value / totalPortfolioValue) * 100 : 0;
                const dotColors = [
                  'bg-yellow-500',
                  'bg-cyan-500',
                  'bg-purple-500',
                  'bg-emerald-500'
                ];
                return (
                  <div key={h.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${dotColors[i % dotColors.length]}`} />
                      <span className="font-bold text-zinc-700 dark:text-zinc-300">{h.symbol}</span>
                    </div>
                    <span className="text-zinc-500 font-mono">({percentage.toFixed(1)}%)</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3.5 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 text-zinc-700 dark:text-zinc-300 text-[10px] leading-relaxed flex items-start gap-2 rounded-xl">
            <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p>
              <strong>Live Balances:</strong> These token balances are queried directly from the blockchain state on <strong>BSC Testnet</strong>. Click any asset below to trade instantly.
            </p>
          </div>
        </div>
      </div>

      {/* Assets & Portfolio Holdings Table Section (Unified, Spacious, No outer boxes) */}
      <div className="space-y-4 pt-6">
        <div>
          <h2 className="text-lg font-black uppercase tracking-tight text-black dark:text-white">
            Your Assets & Portfolio Holdings
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            A complete list of token assets held by the active wallet address.
          </p>
        </div>

        {/* Dynamic Asset List / Table */}
        <div className="w-full overflow-x-auto select-none">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-zinc-150 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-3 pl-1">Asset Name</th>
                <th className="py-3 px-3">Contract Link</th>
                <th className="py-3 px-3">Balance</th>
                <th className="py-3 px-3">Asset Price</th>
                <th className="py-3 px-3">Total Value (USD)</th>
                <th className="py-3 px-3">Change 24h</th>
                <th className="py-3 px-3 text-right pr-2">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
              {holdingsList.map((h) => {
                return (
                  <tr 
                    key={h.id}
                    className="group hover:bg-zinc-50/40 dark:hover:bg-zinc-900/10 transition-colors"
                  >
                    {/* Asset Name */}
                    <td className="py-4 px-3 pl-1">
                      <div className="flex items-center gap-3">
                        <img 
                          src={h.logo} 
                          alt={h.symbol} 
                          className="w-9 h-9 rounded-full object-contain bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/40 dark:border-zinc-850"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="font-bold text-black dark:text-white text-[15px]">
                            {h.symbol}
                          </div>
                          <div className="text-xs text-zinc-400 dark:text-zinc-500">
                            {h.name}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contract Link */}
                    <td className="py-4 px-3">
                      {h.isNative ? (
                        <span className="text-xs text-zinc-400 dark:text-zinc-500">
                          Native BNB Chain
                        </span>
                      ) : h.contract ? (
                        <a 
                          href={`https://testnet.bscscan.com/token/${h.contract}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-mono text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          {h.contract.substring(0, 6)}...{h.contract.substring(h.contract.length - 4)}
                        </a>
                      ) : (
                        <span className="text-xs text-zinc-400 dark:text-zinc-500">-</span>
                      )}
                    </td>

                    {/* Balance */}
                    <td className="py-4 px-3">
                      <div className="font-semibold text-black dark:text-white text-sm">
                        {h.balance.toLocaleString('en-US', { maximumFractionDigits: 6 })} {h.symbol}
                      </div>
                    </td>

                    {/* Asset Price */}
                    <td className="py-4 px-3 font-mono text-sm text-zinc-700 dark:text-zinc-300">
                      ${h.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
                    </td>

                    {/* Total Value (USD) */}
                    <td className="py-4 px-3 font-mono text-sm font-semibold text-black dark:text-white">
                      ${h.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Change 24h */}
                    <td className="py-4 px-3">
                      <span className={`inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded ${h.priceChange24h >= 0 ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                        {h.priceChange24h >= 0 ? '+' : ''}{h.priceChange24h.toFixed(2)}%
                      </span>
                    </td>

                    {/* Quick Action */}
                    <td className="py-4 px-3 text-right pr-2">
                      <div className="flex items-center justify-end gap-2">
                        {h.tokenObj && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectToken(h.tokenObj);
                              setCurrentPage('TOKEN_DETAIL');
                            }}
                            className="text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-zinc-700 dark:text-zinc-300 cursor-pointer"
                          >
                            Details
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAssetClick(h.tokenObj);
                          }}
                          className="text-[11px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:opacity-85 transition-opacity cursor-pointer"
                        >
                          Trade
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
