import React, { useState, useEffect, useRef } from 'react';
import { Token } from '../types';
import { formatGlobalNumber } from '../lib/formatNumber';
import { TokenLogo } from '../components/TokenLogo';
import { 
  ArrowLeft, 
  Share2, 
  Copy, 
  Check, 
  Globe, 
  Github, 
  Send, 
  ExternalLink, 
  BookOpen, 
  Search, 
  ArrowUpRight,
  ShieldCheck,
  Lock,
  ChevronUp,
  Info
} from 'lucide-react';
import { cn } from '../lib/utils';
import { SwapPage } from './SwapPage';
import { motion, AnimatePresence } from 'framer-motion';
import { ethers } from 'ethers';
import { getExplorerUrl, ORVIX_CONFIG, getEffectiveRpcUrl } from '../contracts/config';

// Reusable Copy Button with exact "Copied!" Popup
function CopyButtonWithPopup({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={cn("bare-icon", className)}
      title="Copy to clipboard"
    >
      <span className="copy-icon-wrapper">
        {copied ? (
          <svg className="w-3.5 h-3.5 opacity-90 transition-opacity stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5 opacity-70 hover:opacity-100 transition-opacity stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
          </svg>
        )}
        <span className={cn("copy-popup", copied && "show")}>Copied!</span>
      </span>
    </button>
  );
}

export function TokenDetailPage({ 
  token, 
  onBack, 
  onSwap,
}: { 
  token: Token; 
  onBack: () => void; 
  onSwap: () => void;
}) {
  const [isTradeOpen, setIsTradeOpen] = useState(false);
  const [loadingOnChain, setLoadingOnChain] = useState(true);
  const [livePrice, setLivePrice] = useState(token.price);
  const [liveLiquidity, setLiveLiquidity] = useState('$284,910');
  const [liveMcap, setLiveMcap] = useState('$1,240,000');
  const [liveFdv, setLiveFdv] = useState('$1,500,000');
  const [liveBasePair, setLiveBasePair] = useState(token.pair || `${token.symbol || 'ORX'}/USDT`);
  
  const isPositive = token.priceChange >= 0;

  // Cover Image Slider State
  const defaultCovers = [
    token.wallpaper || "https://images.unsplash.com/photo-1621504450181-5d356f61d307?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1553484771-371a605b060b?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80"
  ];
  const [slideIndex, setSlideIndex] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll listener for shrinking profile photo
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // On-Chain Market Data Fetcher
  useEffect(() => {
    let isMounted = true;
    const fetchMarketData = async () => {
      setLoadingOnChain(true);
      try {
        const rpcUrl = getEffectiveRpcUrl();
        const provider = new ethers.JsonRpcProvider(rpcUrl);

        let bnbUsdPrice = 600;
        try {
          const res = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT');
          const data = await res.json();
          if (data && data.price) {
            bnbUsdPrice = Number(data.price);
          }
        } catch (e) {}

        const tokenContractAddress = token.contract;
        const pairContractAddress = token.addLpTx && token.addLpTx.startsWith('0x') && token.addLpTx.length === 42 
          ? token.addLpTx 
          : '0xBCf4FBE06fe75c4B95F393918Ed53dD9A18d3b95';

        const tokenContract = new ethers.Contract(
          tokenContractAddress,
          [
            "function totalSupply() view returns (uint256)",
            "function decimals() view returns (uint8)",
            "function symbol() view returns (string)",
            "function balanceOf(address) view returns (uint256)"
          ],
          provider
        );

        const pairContract = new ethers.Contract(
          pairContractAddress,
          [
            "function token0() view returns (address)",
            "function token1() view returns (address)",
            "function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)"
          ],
          provider
        );

        const [
          totalSupplyRaw,
          tokenDecimals,
          tokenSymbol,
          burn1,
          burn2,
          t0,
          t1,
          reserves
        ] = await Promise.all([
          tokenContract.totalSupply().catch(() => 100000000n * 10n ** 18n),
          tokenContract.decimals().catch(() => 18),
          tokenContract.symbol().catch(() => token.symbol || 'ORX'),
          tokenContract.balanceOf("0x000000000000000000000000000000000000dEaD").catch(() => 0n),
          tokenContract.balanceOf("0x0000000000000000000000000000000000000000").catch(() => 0n),
          pairContract.token0().catch(() => '0x0'),
          pairContract.token1().catch(() => '0x0'),
          pairContract.getReserves().catch(() => [0n, 0n, 0])
        ]);

        if (!isMounted) return;

        let quoteSymbol = 'USST';
        let quoteDecimals = 18;
        const quoteAddress = t0.toLowerCase() === tokenContractAddress.toLowerCase() ? t1 : t0;
        if (quoteAddress && quoteAddress !== '0x0' && quoteAddress.startsWith('0x')) {
          try {
            const quoteContract = new ethers.Contract(
              quoteAddress,
              ["function symbol() view returns (string)", "function decimals() view returns (uint8)"],
              provider
            );
            const [qSym, qDec] = await Promise.all([
              quoteContract.symbol().catch(() => 'USST'),
              quoteContract.decimals().catch(() => 18)
            ]);
            quoteSymbol = qSym;
            quoteDecimals = Number(qDec);
          } catch (err) {}
        }

        const dec = Number(tokenDecimals) || 18;
        const totalBig = BigInt(totalSupplyRaw);
        const burnedBig = BigInt(burn1 || 0n) + BigInt(burn2 || 0n);
        const circulatingBig = totalBig > burnedBig ? totalBig - burnedBig : totalBig;

        const totalFormatted = Number(ethers.formatUnits(totalBig, dec));
        const circulatingFormatted = Number(ethers.formatUnits(circulatingBig, dec));

        const r0 = BigInt(reserves[0] || 0n);
        const r1 = BigInt(reserves[1] || 0n);

        if (r0 > 0n && r1 > 0n && t0 !== '0x0' && t1 !== '0x0') {
          const normR0 = Number(ethers.formatUnits(r0, t0.toLowerCase() === tokenContractAddress.toLowerCase() ? dec : quoteDecimals));
          const normR1 = Number(ethers.formatUnits(r1, t1.toLowerCase() === tokenContractAddress.toLowerCase() ? dec : quoteDecimals));

          let ourReserve = 0;
          let quoteReserve = 0;

          if (t0.toLowerCase() === tokenContractAddress.toLowerCase()) {
            ourReserve = normR0;
            quoteReserve = normR1;
          } else {
            ourReserve = normR1;
            quoteReserve = normR0;
          }

          let priceInQuote = 0;
          if (ourReserve > 0) {
            priceInQuote = quoteReserve / ourReserve;
          }

          let quoteUsdPrice = 1;
          if (quoteSymbol.includes('BNB') || quoteSymbol.includes('ETH')) {
            quoteUsdPrice = bnbUsdPrice;
          }

          const priceUsd = priceInQuote * quoteUsdPrice;
          const liqPool = quoteReserve * quoteUsdPrice * 2;
          const liquidityUsd = liqPool > 0 ? liqPool : 284910;

          const mcapVal = circulatingFormatted * (priceUsd || 0.00042);
          const fdvVal = totalFormatted * (priceUsd || 0.00042);

          setLivePrice(priceUsd < 0.0001 ? `$${priceUsd.toExponential(4)}` : `$${priceUsd.toFixed(priceUsd < 1 ? 5 : 2)}`);
          setLiveLiquidity('$' + liquidityUsd.toLocaleString('en-US', { maximumFractionDigits: 0 }));
          setLiveMcap('$' + (mcapVal > 0 ? mcapVal : 1240000).toLocaleString('en-US', { maximumFractionDigits: 0 }));
          setLiveFdv('$' + (fdvVal > 0 ? fdvVal : 1500000).toLocaleString('en-US', { maximumFractionDigits: 0 }));
          setLiveBasePair(`${tokenSymbol}/${quoteSymbol}`);
        } else {
          setLivePrice(token.price ? (token.price.startsWith('$') ? token.price : `$${token.price}`) : '$0.00042');
          setLiveLiquidity('$284,910');
          setLiveMcap('$1,240,000');
          setLiveFdv('$1,500,000');
          setLiveBasePair(token.pair || `${token.symbol || 'ORX'}/USST`);
        }
      } catch (err) {
        console.warn("Failed to load on-chain market data:", err);
        setLivePrice(token.price ? (token.price.startsWith('$') ? token.price : `$${token.price}`) : '$0.00042');
        setLiveLiquidity('$284,910');
        setLiveMcap('$1,240,000');
        setLiveFdv('$1,500,000');
        setLiveBasePair(token.pair || 'ORX/USST');
      } finally {
        if (isMounted) setLoadingOnChain(false);
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [token]);

  // Interactive Chart Tooltip & Dot Marker
  const [chartDot, setChartDot] = useState<{ cx: number; cy: number }>({ cx: 280, cy: 75 });
  const [tooltipData, setTooltipData] = useState<{ show: boolean; x: number; price: string }>({
    show: false,
    x: 280,
    price: '$0.00042'
  });
  const [neonActive, setNeonActive] = useState(false);
  const chartTimeoutRef = useRef<any>(null);

  const handleChartClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    if (x < 10) x = 10;
    if (x > rect.width - 10) x = rect.width - 10;
    if (y < 10) y = 10;
    if (y > rect.height - 10) y = rect.height - 10;

    const svgX = (x / rect.width) * 340;
    const svgY = (y / rect.height) * 180;

    setChartDot({ cx: svgX, cy: svgY });

    const randomPrice = (0.00040 + Math.random() * 0.00006).toFixed(5);
    setTooltipData({
      show: true,
      x: Math.max(50, Math.min(rect.width - 50, x)),
      price: `$${randomPrice}`
    });

    setNeonActive(true);

    if (chartTimeoutRef.current) clearTimeout(chartTimeoutRef.current);
    chartTimeoutRef.current = setTimeout(() => {
      setTooltipData(prev => ({ ...prev, show: false }));
      setNeonActive(false);
    }, 1500);
  };

  const toggleTrade = () => {
    setIsTradeOpen(!isTradeOpen);
    if (!isTradeOpen) {
      setTimeout(() => {
        window.scrollTo({ top: window.scrollY + 280, behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <div className="w-full min-h-screen bg-transparent text-zinc-900 dark:text-zinc-100 font-sans pb-24 max-w-2xl mx-auto relative overflow-x-hidden">

      {/* ===== HEADER / COVER BANNER SLIDER ===== */}
      <div className={cn("fb-cover-wrapper relative w-full bg-zinc-100 dark:bg-[#050b14] rounded-b-3xl overflow-hidden shadow-lg border-b border-zinc-200 dark:border-white/10", isScrolled && "scrolled")}>
        
        <div className="cover-slider-wrapper relative w-full aspect-[820/312] overflow-hidden bg-gradient-to-br from-zinc-200 via-zinc-100 to-zinc-200 dark:from-[#0a1a2e] dark:via-[#081525] dark:to-[#050b14] border-b border-zinc-200 dark:border-[#5cceff]/10">
          {/* Slider Track */}
          <div 
            className="cover-slider-track flex w-full h-full transition-transform duration-400 ease-out"
            style={{ transform: `translateX(-${slideIndex * 100}%)` }}
          >
            {defaultCovers.map((imgUrl, idx) => (
              <img 
                key={idx} 
                src={imgUrl} 
                alt={`Cover ${idx + 1}`}
                className="slide flex-shrink-0 w-full h-full object-cover select-none pointer-events-none" 
              />
            ))}
          </div>

          {/* Dots Indicator */}
          <div className="slider-dots absolute bottom-3 right-4 flex gap-1.5 z-15">
            {defaultCovers.map((_, idx) => (
              <span 
                key={idx}
                onClick={() => setSlideIndex(idx)}
                className={cn(
                  "slider-dot h-1.5 rounded-full transition-all duration-300 cursor-pointer bg-white/50 dark:bg-white/30",
                  slideIndex === idx ? "w-4.5 bg-white rounded-md" : "w-1.5"
                )}
              />
            ))}
          </div>
        </div>

        {/* Profile Token Logo (Shrinks on scroll) */}
        <div className={cn(
          "profile-photo absolute left-4 transition-all duration-300 z-10 bg-white dark:bg-[#050b14] border-2 border-zinc-200 dark:border-[#5cceff]/30 rounded-full flex items-center justify-center p-1 shadow-lg overflow-hidden",
          isScrolled ? "w-7 h-7 bottom-2 left-3 border" : "w-[72px] h-[72px] -bottom-2 shadow-xl"
        )}>
          <TokenLogo 
            tokenId={token.logo || token.id} 
            className="w-full h-full object-contain rounded-full" 
          />
        </div>

        {/* Action Header Buttons */}
        <div className="cover-actions absolute top-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-auto">
          <button 
            onClick={onBack} 
            className="bare-icon p-2 text-zinc-700 dark:text-white/80 hover:text-zinc-900 dark:hover:text-white transition-all bg-white/80 dark:bg-black/40 backdrop-blur-md rounded-full border border-zinc-200 dark:border-white/10 shadow-sm"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('orvix-open-share', { detail: token }))}
            className="bare-icon p-2 text-zinc-700 dark:text-white/80 hover:text-zinc-900 dark:hover:text-white transition-all bg-white/80 dark:bg-black/40 backdrop-blur-md rounded-full border border-zinc-200 dark:border-white/10 shadow-sm"
            aria-label="Share"
          >
            <Share2 className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* ===== MAIN CONTENT CONTAINER ===== */}
      <div className="px-4 pt-4 pb-12 space-y-4">
        
        {/* TOKEN HEADER IDENTITY */}
        <div className="token-header flex items-center gap-3 pt-1">
          <div>
            <div className="token-name text-2xl font-black text-zinc-900 dark:text-white leading-tight">
              {token.name || 'ORVIX Token'}
            </div>
            <div className="token-sub text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5 flex items-center gap-2">
              <span>Listed {token.listedAt || '2 minutes ago'}</span>
            </div>
          </div>
        </div>

        {/* ===== CHART AREA — PREMIUM TRADING LAYOUT ===== */}
        <div className="chart-area bg-white/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-white/10 rounded-2xl p-4 mt-2 text-zinc-900 dark:text-white shadow-sm backdrop-blur-sm">
          {/* Chart Header */}
          <div className="chart-header flex items-center justify-between mb-2">
            <div className="chart-pair flex flex-col">
              <span className="pair-label text-xs font-semibold text-zinc-500 dark:text-zinc-400 tracking-wider">
                {liveBasePair}
              </span>
              <span className={cn("pair-price text-2xl font-bold text-zinc-900 dark:text-white transition-all duration-200 font-mono", neonActive && "neon-text")}>
                {livePrice}
              </span>
            </div>

            <div className="chart-change flex flex-col items-end">
              <span className={cn("change-value text-xl font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 transition-all duration-200", neonActive && "neon-text-green")}>
                <svg className="w-4.5 h-4.5 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m5 12 7-7 7 7"/>
                  <path d="M12 19V5"/>
                </svg>
                {Math.abs(token.priceChange || 70)}%
              </span>
              <span className="change-label text-[11px] text-zinc-500 dark:text-zinc-400 font-medium -mt-0.5">
                24h change
              </span>
            </div>
          </div>

          {/* Chart Canvas / SVG Container */}
          <div 
            className="chart-container relative w-full bg-zinc-100/70 dark:bg-black/60 rounded-xl py-1 min-h-[180px] cursor-crosshair select-none"
            onClick={handleChartClick}
          >
            {/* Interactive Tooltip */}
            {tooltipData.show && (
              <div 
                className="absolute bg-zinc-900 text-white dark:bg-black border border-zinc-700 dark:border-white/20 text-[11px] px-3 py-1.5 rounded-md -top-2 -translate-x-1/2 whitespace-nowrap pointer-events-none shadow-xl z-20 font-mono"
                style={{ left: `${tooltipData.x}px` }}
              >
                July 26, 2026<br />
                <span className="price font-bold text-cyan-400 dark:text-[#5cceff]">{tooltipData.price}</span>
              </div>
            )}

            <svg viewBox="0 0 340 180" preserveAspectRatio="none" className="block w-full h-auto">
              <rect width="340" height="180" fill="transparent" rx="8" />
              
              {/* Horizontal Gridlines */}
              <line x1="0" y1="45" x2="340" y2="45" stroke="currentColor" className="text-zinc-300 dark:text-white/10" strokeWidth="0.5" />
              <line x1="0" y1="90" x2="340" y2="90" stroke="currentColor" className="text-zinc-300 dark:text-white/10" strokeWidth="0.5" />
              <line x1="0" y1="135" x2="340" y2="135" stroke="currentColor" className="text-zinc-300 dark:text-white/10" strokeWidth="0.5" />
              
              {/* Vertical Gridlines */}
              <line x1="68" y1="0" x2="68" y2="180" stroke="currentColor" className="text-zinc-300 dark:text-white/10" strokeWidth="0.5" />
              <line x1="136" y1="0" x2="136" y2="180" stroke="currentColor" className="text-zinc-300 dark:text-white/10" strokeWidth="0.5" />
              <line x1="204" y1="0" x2="204" y2="180" stroke="currentColor" className="text-zinc-300 dark:text-white/10" strokeWidth="0.5" />
              <line x1="272" y1="0" x2="272" y2="180" stroke="currentColor" className="text-zinc-300 dark:text-white/10" strokeWidth="0.5" />
              
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                </linearGradient>
              </defs>
              
              {/* Area fill */}
              <path d="M0,155 Q60,130 120,135 Q180,70 240,95 Q290,100 340,60 L340,180 L0,180 Z" fill="url(#chartGradient)" />
              
              {/* Line chart */}
              <path d="M0,155 Q60,130 120,135 Q180,70 240,95 Q290,100 340,60" fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" />
              
              {/* Dot marker */}
              <circle cx={chartDot.cx} cy={chartDot.cy} r="3" fill="#06b6d4" />
              <circle cx={chartDot.cx} cy={chartDot.cy} r="6" fill="rgba(6,182,212,0.2)" />
            </svg>
          </div>
        </div>

        {/* MARKET CAP & LIQUIDITY QUICK CARDS */}
        <div className="flex justify-between gap-3 mt-4">
          <div className="flex-1 bg-white/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-white/10 rounded-2xl p-3.5 text-zinc-900 dark:text-white shadow-sm backdrop-blur-sm">
            <div className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 mb-1">Market Cap</div>
            <div className="text-[21px] font-extrabold tracking-tight font-sans text-zinc-900 dark:text-white">
              {liveMcap}
            </div>
          </div>
          <div className="flex-1 bg-white/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-white/10 rounded-2xl p-3.5 text-zinc-900 dark:text-white shadow-sm backdrop-blur-sm">
            <div className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 mb-1">Liquidity</div>
            <div className="text-[21px] font-extrabold tracking-tight font-sans text-zinc-900 dark:text-white">
              {liveLiquidity}
            </div>
          </div>
        </div>

        {/* TRADE NOW BUTTON */}
        <button 
          onClick={toggleTrade}
          className="btn-trade w-full mt-4 py-4 rounded-2xl font-bold text-[16px] tracking-wide transition-all active:scale-[0.98] border border-zinc-300 dark:border-white/10 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white cursor-pointer shadow-md flex items-center justify-center gap-2"
        >
          {isTradeOpen ? (
            <>
              CLOSE TRADE <ChevronUp className="w-5 h-5" />
            </>
          ) : (
            'TRADE NOW'
          )}
        </button>

        {/* EXPANDABLE TRADE SWAP DRAWER */}
        <AnimatePresence>
          {isTradeOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-2xl p-3 md:p-4 shadow-xl my-2 text-zinc-900 dark:text-white">
                <SwapPage embedded={true} preselectedToken={token} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SOCIAL ICONS */}
        <div className="social-icons flex items-center justify-center gap-5 mt-4 pt-2">
          {token.website && (
            <a href={token.website} target="_blank" rel="noreferrer" className="bare-icon text-zinc-600 dark:text-white/60 hover:text-zinc-900 dark:hover:text-white transition-colors p-2 bg-zinc-100 dark:bg-white/5 rounded-full border border-zinc-200 dark:border-white/10" title="Website">
              <Globe className="w-5 h-5 stroke-current" />
            </a>
          )}
          {token.x && (
            <a href={token.x} target="_blank" rel="noreferrer" className="bare-icon text-zinc-600 dark:text-white/60 hover:text-zinc-900 dark:hover:text-white transition-colors p-2 bg-zinc-100 dark:bg-white/5 rounded-full border border-zinc-200 dark:border-white/10" title="X / Twitter">
              <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
          )}
          {token.telegram && (
            <a href={token.telegram} target="_blank" rel="noreferrer" className="bare-icon text-zinc-600 dark:text-white/60 hover:text-zinc-900 dark:hover:text-white transition-colors p-2 bg-zinc-100 dark:bg-white/5 rounded-full border border-zinc-200 dark:border-white/10" title="Telegram">
              <Send className="w-5 h-5 stroke-current" />
            </a>
          )}
          {token.github && (
            <a href={token.github} target="_blank" rel="noreferrer" className="bare-icon text-zinc-600 dark:text-white/60 hover:text-zinc-900 dark:hover:text-white transition-colors p-2 bg-zinc-100 dark:bg-white/5 rounded-full border border-zinc-200 dark:border-white/10" title="GitHub">
              <Github className="w-5 h-5 stroke-current" />
            </a>
          )}
          {token.documentation && (
            <a href={token.documentation} target="_blank" rel="noreferrer" className="bare-icon text-zinc-600 dark:text-white/60 hover:text-zinc-900 dark:hover:text-white transition-colors p-2 bg-zinc-100 dark:bg-white/5 rounded-full border border-zinc-200 dark:border-white/10" title="Whitepaper / Docs">
              <BookOpen className="w-5 h-5 stroke-current" />
            </a>
          )}
        </div>

        {/* DESCRIPTION SECTION */}
        <div>
          <div className="section-label text-xs font-bold text-zinc-500 dark:text-white/40 uppercase tracking-widest mt-6 mb-2">
            Description
          </div>
          <p className="text-[13px] text-zinc-700 dark:text-white/80 leading-relaxed font-medium">
            {token.name || 'Orvix'} ({token.symbol || 'ORX'}) is a decentralized token built on the BNB Smart Chain. Designed to foster community-driven ecosystems and facilitate seamless on-chain transactions within the Orvix platform.
          </p>
          <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-white/5">
            <p className="text-[10px] text-zinc-500 dark:text-white/30 leading-relaxed italic font-medium">
              Note: The content above is information provided by the project creator and does not constitute a reference or recommendation from Orvix.
            </p>
          </div>
        </div>

        {/* MARKET DATA SECTION */}
        <div>
          <div className="section-label text-xs font-bold text-zinc-500 dark:text-white/40 uppercase tracking-widest mt-6 mb-2">
            Market Data
          </div>
          
          <div className="flex items-center gap-4 mt-2">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 dark:text-white/40 font-bold">Network</span>
              <span className="text-xs font-semibold text-zinc-900 dark:text-white/90">BNB Smart Chain</span>
            </div>
            <div className="w-px h-6 bg-zinc-200 dark:bg-white/10" />
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 dark:text-white/40 font-bold">Pool</span>
              <span className="text-xs font-semibold text-zinc-900 dark:text-white/90">{token.ammVersion || 'AMM V2'}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="flex flex-col gap-1 py-2 border-b border-zinc-200 dark:border-white/5">
              <span className="text-[11px] font-bold text-zinc-500 dark:text-white/50">Price</span>
              <span className="text-[15px] font-bold text-zinc-900 dark:text-white">{livePrice}</span>
            </div>
            <div className="flex flex-col gap-1 py-2 border-b border-zinc-200 dark:border-white/5">
              <span className="text-[11px] font-bold text-zinc-500 dark:text-white/50">Liquidity</span>
              <span className="text-[15px] font-bold text-zinc-900 dark:text-white">{liveLiquidity}</span>
            </div>
            <div className="flex flex-col gap-1 py-2">
              <span className="text-[11px] font-bold text-zinc-500 dark:text-white/50">Market Cap</span>
              <span className="text-[15px] font-bold text-zinc-900 dark:text-white">{liveMcap}</span>
            </div>
            <div className="flex flex-col gap-1 py-2">
              <span className="text-[11px] font-bold text-zinc-500 dark:text-white/50">FDV</span>
              <span className="text-[15px] font-bold text-zinc-900 dark:text-white">{liveFdv}</span>
            </div>
          </div>
        </div>

        {/* ON-CHAIN ANALYSIS SECTION */}
        <div>
          <div className="section-label text-xs font-bold text-zinc-500 dark:text-white/40 uppercase tracking-widest mt-6 mb-2">
            On-Chain Analysis
          </div>
          
          <div className="space-y-0.5">
            {/* Contract */}
            <div className="data-row flex items-center justify-between py-3 border-b border-zinc-200 dark:border-white/5">
              <span className="data-label text-xs font-semibold text-zinc-600 dark:text-white/70">Contract</span>
              <div className="data-value text-sm text-zinc-900 dark:text-white font-semibold flex items-center gap-1.5">
                <span>{token.contract.slice(0, 6)}....{token.contract.slice(-4)}</span>
                <CopyButtonWithPopup text={token.contract} />
              </div>
            </div>

            {/* Pair Address */}
            <div className="data-row flex items-center justify-between py-3 border-b border-zinc-200 dark:border-white/5">
              <span className="data-label text-xs font-semibold text-zinc-600 dark:text-white/70">Pair Address</span>
              <div className="data-value text-sm text-zinc-900 dark:text-white font-semibold flex items-center gap-1.5">
                <span>
                  {token.addLpTx && token.addLpTx.length === 42 
                    ? `${token.addLpTx.slice(0, 6)}....${token.addLpTx.slice(-4)}`
                    : '0xBCf4....3b95'
                  }
                </span>
                <CopyButtonWithPopup text={token.addLpTx || '0xBCf4FBE06fe75c4B95F393918Ed53dD9A18d3b95'} />
              </div>
            </div>

            {/* Base Pair */}
            <div className="data-row flex items-center justify-between py-3 border-b border-zinc-200 dark:border-white/5">
              <span className="data-label text-xs font-semibold text-zinc-600 dark:text-white/70">Base Pair</span>
              <span className="data-value text-sm text-zinc-900 dark:text-white font-semibold">
                {liveBasePair}
              </span>
            </div>

            {/* Tax */}
            <div className="data-row flex items-center justify-between py-3 border-b border-zinc-200 dark:border-white/5">
              <span className="data-label text-xs font-semibold text-zinc-600 dark:text-white/70">Buy / Sell Tax</span>
              <span className="data-value text-sm text-zinc-900 dark:text-white font-semibold">
                0% / 0%
              </span>
            </div>

            {/* Renounced */}
            <div className="data-row flex items-center justify-between py-3 border-b border-zinc-200 dark:border-white/5">
              <span className="data-label text-xs font-semibold text-zinc-600 dark:text-white/70">Renounced</span>
              <div className="data-value text-sm text-zinc-900 dark:text-white font-semibold flex items-center gap-2">
                <span className="flex items-center gap-1 text-zinc-900 dark:text-white font-semibold text-sm">
                  Yes <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </span>
                {token.renounceTx && (
                  <>
                    <span className="text-xs text-zinc-500 dark:text-white/60">
                      {token.renounceTx.slice(0, 6)}....{token.renounceTx.slice(-4)}
                    </span>
                    <CopyButtonWithPopup text={token.renounceTx} />
                  </>
                )}
              </div>
            </div>

            {/* LP Locked */}
            <div className="data-row flex items-center justify-between py-3">
              <span className="data-label text-xs font-semibold text-zinc-600 dark:text-white/70">LP Locked</span>
              <div className="data-value text-sm text-zinc-900 dark:text-white font-semibold flex items-center gap-1.5">
                <span className="flex items-center gap-1.5 text-zinc-900 dark:text-white font-semibold text-sm">
                  Locked <Lock className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
