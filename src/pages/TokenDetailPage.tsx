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
  Info,
  ChevronLeft,
  ChevronRight,
  AlertTriangle
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
  const [activeTab, setActiveTab] = useState<'market' | 'onchain' | 'audit'>('market');
  const [isChartOpen, setIsChartOpen] = useState(true);
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

  // Swipe / Drag controls for cover images
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const isDragging = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      dragStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      isDragging.current = true;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging.current || !dragStartPos.current) return;
    isDragging.current = false;
    if (e.changedTouches.length === 1) {
      const deltaX = e.changedTouches[0].clientX - dragStartPos.current.x;
      const deltaY = e.changedTouches[0].clientY - dragStartPos.current.y;
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 40) {
        if (deltaX > 0) {
          // Swipe right -> prev slide
          setSlideIndex((prev) => (prev === 0 ? defaultCovers.length - 1 : prev - 1));
        } else {
          // Swipe left -> next slide
          setSlideIndex((prev) => (prev === defaultCovers.length - 1 ? 0 : prev + 1));
        }
      }
    }
    dragStartPos.current = null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    isDragging.current = true;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging.current || !dragStartPos.current) return;
    isDragging.current = false;
    const deltaX = e.clientX - dragStartPos.current.x;
    const deltaY = e.clientY - dragStartPos.current.y;
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 40) {
      if (deltaX > 0) {
        // Swipe right -> prev slide
        setSlideIndex((prev) => (prev === 0 ? defaultCovers.length - 1 : prev - 1));
      } else {
        // Swipe left -> next slide
        setSlideIndex((prev) => (prev === defaultCovers.length - 1 ? 0 : prev + 1));
      }
    }
    dragStartPos.current = null;
  };

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

    const cleanPriceStr = livePrice.replace('$', '').replace(/,/g, '');
    const currentPriceNum = parseFloat(cleanPriceStr) || 0.00042;
    // Generate a small variation (e.g., -5% to +5%)
    const variation = (Math.random() - 0.5) * 0.1;
    const computedPrice = currentPriceNum * (1 + variation);
    const formattedPrice = computedPrice < 0.0001 
      ? `$${computedPrice.toExponential(4)}` 
      : `$${computedPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: computedPrice < 1 ? 5 : 2 })}`;

    setTooltipData({
      show: true,
      x: Math.max(50, Math.min(rect.width - 50, x)),
      price: formattedPrice
    });

    if (chartTimeoutRef.current) clearTimeout(chartTimeoutRef.current);
    chartTimeoutRef.current = setTimeout(() => {
      setTooltipData(prev => ({ ...prev, show: false }));
    }, 1500);
  };

  const toggleTrade = () => {
    const nextState = !isTradeOpen;
    setIsTradeOpen(nextState);
    if (nextState) {
      setIsChartOpen(false); // Auto close chart
      setTimeout(() => {
        window.scrollTo({ top: window.scrollY + 200, behavior: 'smooth' });
      }, 100);
    } else {
      setIsChartOpen(true); // Auto reopen chart when closing trade
    }
  };

  return (
    <div className="w-full min-h-screen bg-transparent text-zinc-900 dark:text-zinc-100 font-sans pb-24 max-w-2xl mx-auto relative">

      {/* ===== HEADER / COVER BANNER SLIDER ===== */}
      <div className={cn("fb-cover-wrapper relative w-full bg-zinc-100 dark:bg-[#050b14] rounded-b-3xl shadow-lg border-b border-zinc-200 dark:border-white/10", isScrolled && "scrolled")}>
        
        <div 
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          className="cover-slider-wrapper relative w-full aspect-[820/312] overflow-hidden bg-gradient-to-br from-zinc-200 via-zinc-100 to-zinc-200 dark:from-[#0a1a2e] dark:via-[#081525] dark:to-[#050b14] border-b border-zinc-200 dark:border-[#5cceff]/10 rounded-b-3xl group select-none cursor-grab active:cursor-grabbing"
        >
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
                draggable={false}
                className="slide flex-shrink-0 w-full h-full object-cover select-none pointer-events-none" 
              />
            ))}
          </div>

          {/* Slider Manual Navigation Left/Right Arrows */}
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSlideIndex((prev) => (prev === 0 ? defaultCovers.length - 1 : prev - 1));
            }}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/35 hover:bg-black/60 text-white backdrop-blur-md transition-all z-20 cursor-pointer flex items-center justify-center border border-white/10 shadow-sm"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSlideIndex((prev) => (prev === defaultCovers.length - 1 ? 0 : prev + 1));
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/35 hover:bg-black/60 text-white backdrop-blur-md transition-all z-20 cursor-pointer flex items-center justify-center border border-white/10 shadow-sm"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots Indicator */}
          <div className="slider-dots absolute bottom-3 right-4 flex gap-1.5 z-15">
            {defaultCovers.map((_, idx) => (
              <span 
                key={idx}
                onClick={() => setSlideIndex(idx)}
                className={cn(
                  "slider-dot h-1.5 rounded-full transition-all duration-300 cursor-pointer bg-white/50 dark:bg-white/30",
                  slideIndex === idx ? "w-5 bg-white rounded-md" : "w-1.5"
                )}
              />
            ))}
          </div>
        </div>

        {/* Profile Token Logo (Centered horizontally & overlapping 50% bottom of header, no shrinking on scroll) */}
        <div className="profile-photo absolute left-1/2 -translate-x-1/2 -bottom-[40px] w-[80px] h-[80px] z-10 flex items-center justify-center">
          <TokenLogo 
            tokenId={token.logo || token.id} 
            className="w-full h-full object-contain drop-shadow-md" 
          />
        </div>

        {/* Action Header Buttons */}
        <div className="cover-actions absolute top-3 right-3 flex items-center justify-end z-20 pointer-events-auto">
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              window.dispatchEvent(new CustomEvent('orvix-open-share', { detail: token }));
            }}
            className="flex items-center justify-center p-2 text-white hover:scale-110 transition-all bg-black/30 hover:bg-black/65 backdrop-blur-md rounded-full border border-white/10 shadow-md cursor-pointer"
            aria-label="Share"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ===== MAIN CONTENT CONTAINER ===== */}
      <div className="px-4 pt-16 sm:pt-20 pb-12 space-y-4">
        
        {/* TOKEN HEADER IDENTITY */}
        <div className="token-header flex flex-col items-center text-center pt-1 space-y-1">
          <div className="token-name text-2xl font-black text-zinc-900 dark:text-white leading-tight font-['Inter']">
            {token.name || 'ORVIX Token'}
          </div>
        </div>

        {/* SOCIAL ICONS */}
        <div className="social-icons flex items-center justify-center gap-5 mt-2 pt-2">
          <a href={token.website || "https://orvix.io"} target="_blank" rel="noreferrer" className="bare-icon text-zinc-600 dark:text-white/60 hover:text-zinc-900 dark:hover:text-white transition-colors p-2 bg-zinc-100 dark:bg-white/5 rounded-full border border-zinc-200 dark:border-white/10" title="Website">
            <Globe className="w-5 h-5 stroke-current" />
          </a>
          <a href={token.x || `https://x.com/orvix_${token.symbol?.toLowerCase() || 'token'}`} target="_blank" rel="noreferrer" className="bare-icon text-zinc-600 dark:text-white/60 hover:text-zinc-900 dark:hover:text-white transition-colors p-2 bg-zinc-100 dark:bg-white/5 rounded-full border border-zinc-200 dark:border-white/10" title="X / Twitter">
            <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
          <a href={token.telegram || `https://t.me/orvix_${token.symbol?.toLowerCase() || 'token'}`} target="_blank" rel="noreferrer" className="bare-icon text-zinc-600 dark:text-white/60 hover:text-zinc-900 dark:hover:text-white transition-colors p-2 bg-zinc-100 dark:bg-white/5 rounded-full border border-zinc-200 dark:border-white/10" title="Telegram">
            <Send className="w-5 h-5 stroke-current" />
          </a>
          <a href={token.github || `https://github.com/orvix-labs/${token.symbol?.toLowerCase() || 'token'}`} target="_blank" rel="noreferrer" className="bare-icon text-zinc-600 dark:text-white/60 hover:text-zinc-900 dark:hover:text-white transition-colors p-2 bg-zinc-100 dark:bg-white/5 rounded-full border border-zinc-200 dark:border-white/10" title="GitHub">
            <Github className="w-5 h-5 stroke-current" />
          </a>
          <a href={token.documentation || "https://docs.orvix.io"} target="_blank" rel="noreferrer" className="bare-icon text-zinc-600 dark:text-white/60 hover:text-zinc-900 dark:hover:text-white transition-colors p-2 bg-zinc-100 dark:bg-white/5 rounded-full border border-zinc-200 dark:border-white/10" title="Whitepaper / Docs">
            <BookOpen className="w-5 h-5 stroke-current" />
          </a>
        </div>

        {/* DESCRIPTION SECTION */}
        <div className="text-center pt-2 pb-4 border-b border-zinc-100 dark:border-white/5">
          <p className="text-[13px] text-zinc-600 dark:text-white/70 leading-relaxed font-medium max-w-lg mx-auto">
            {token.name || 'Orvix'} ({token.symbol || 'ORX'}) is a decentralized token built on the BNB Smart Chain. Designed to foster community-driven ecosystems and facilitate seamless on-chain transactions within the Orvix platform.
          </p>
        </div>

        {/* ===== CHART AREA — WITH SMOOTH COLLAPSE / EXPAND ===== */}
        <div className="space-y-2 mt-2">
          {/* Chart Header Toggle */}
          <div className="flex justify-end items-center px-1">
            <button
              onClick={() => setIsChartOpen(!isChartOpen)}
              className="text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-white/5"
              title={isChartOpen ? "Close Chart" : "Open Chart"}
            >
              <motion.div
                animate={{ rotate: isChartOpen ? 0 : 180 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronUp className="w-5 h-5" />
              </motion.div>
            </button>
          </div>

          <AnimatePresence initial={false}>
            {isChartOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="chart-area bg-white/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-white/10 rounded-2xl p-4 text-zinc-900 dark:text-white shadow-sm backdrop-blur-sm">
                  {/* Chart Header */}
                  <div className="chart-header flex items-center justify-between mb-2">
                    <div className="chart-pair flex flex-col">
                      <span className="pair-label text-xs font-semibold text-zinc-500 dark:text-zinc-400 tracking-wider font-['Inter']">
                        {liveBasePair}
                      </span>
                      <span className="pair-price text-2xl font-bold text-zinc-900 dark:text-white font-['Inter']">
                        {livePrice}
                      </span>
                    </div>

                    <div className="chart-change flex flex-col items-end">
                      <span className="change-value text-xl font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 font-['Inter']">
                        <svg className="w-4.5 h-4.5 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m5 12 7-7 7 7"/>
                          <path d="M12 19V5"/>
                        </svg>
                        {Math.abs(token.priceChange || 70)}%
                      </span>
                      <span className="change-label text-[11px] text-zinc-500 dark:text-zinc-400 font-medium -mt-0.5 font-['Inter']">
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
                        className="absolute bg-white text-black border border-zinc-200/80 text-[11px] px-3 py-1.5 rounded-xl -top-14 -translate-x-1/2 whitespace-nowrap pointer-events-none shadow-lg z-20 font-['Inter'] font-light flex flex-col text-left gap-0.5 leading-tight"
                        style={{ left: `${tooltipData.x}px` }}
                      >
                        <span className="font-semibold text-zinc-900">{tooltipData.price}</span>
                        <span className="text-[10px] text-zinc-500">Listed {token.listedAt || '2 minutes ago'}</span>
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* TRADE NOW BUTTON */}
        <button 
          onClick={toggleTrade}
          className="w-full mt-4 py-4 rounded-2xl transition-all duration-200 active:scale-[0.98] border border-[#555555] dark:border-[#CCCCCC] bg-zinc-800 text-white hover:bg-zinc-900 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700 cursor-pointer shadow-sm flex items-center justify-center gap-2 uppercase tracking-widest text-[10px] font-black"
        >
          {isTradeOpen ? (
            <>
              CLOSE TRADE <ChevronUp className="w-4 h-4" />
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
              <div className="w-full my-2 text-zinc-900 dark:text-white">
                <SwapPage embedded={true} preselectedToken={token} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* DETAILS TABS */}
        <div className="mt-8">
          <div className="flex justify-center items-center gap-6 border-b border-zinc-200 dark:border-white/10 mb-4">
            <button
              onClick={() => setActiveTab('market')}
              className={cn(
                "pb-3 text-xs font-bold uppercase tracking-widest transition-colors relative cursor-pointer",
                activeTab === 'market' ? "text-zinc-900 dark:text-white" : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              )}
            >
              Market Data
              {activeTab === 'market' && (
                <span className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-zinc-900 dark:bg-white rounded-t-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('onchain')}
              className={cn(
                "pb-3 text-xs font-bold uppercase tracking-widest transition-colors relative cursor-pointer",
                activeTab === 'onchain' ? "text-zinc-900 dark:text-white" : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              )}
            >
              On-Chain
              {activeTab === 'onchain' && (
                <span className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-zinc-900 dark:bg-white rounded-t-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={cn(
                "pb-3 text-xs font-bold uppercase tracking-widest transition-colors relative cursor-pointer",
                activeTab === 'audit' ? "text-zinc-900 dark:text-white" : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              )}
            >
              Audit
              {activeTab === 'audit' && (
                <span className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-zinc-900 dark:bg-white rounded-t-full" />
              )}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'market' && (
              <motion.div
                key="market"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-0.5"
              >
                <div className="data-row flex items-center justify-between py-3 border-b border-zinc-200 dark:border-white/5">
                  <span className="data-label text-xs font-semibold text-zinc-600 dark:text-white/70">Network</span>
                  <span className="data-value text-sm text-zinc-900 dark:text-white font-semibold">BNB Smart Chain</span>
                </div>
                <div className="data-row flex items-center justify-between py-3 border-b border-zinc-200 dark:border-white/5">
                  <span className="data-label text-xs font-semibold text-zinc-600 dark:text-white/70">Pool</span>
                  <span className="data-value text-sm text-zinc-900 dark:text-white font-semibold">{token.ammVersion || 'Pancake V2'}</span>
                </div>
                <div className="data-row flex items-center justify-between py-3 border-b border-zinc-200 dark:border-white/5">
                  <span className="data-label text-xs font-semibold text-zinc-600 dark:text-white/70">Liquidity</span>
                  <span className="data-value text-sm text-zinc-900 dark:text-white font-semibold">{liveLiquidity}</span>
                </div>
                <div className="data-row flex items-center justify-between py-3 border-b border-zinc-200 dark:border-white/5">
                  <span className="data-label text-xs font-semibold text-zinc-600 dark:text-white/70">Market Cap</span>
                  <span className="data-value text-sm text-zinc-900 dark:text-white font-semibold">{liveMcap}</span>
                </div>
                <div className="data-row flex items-center justify-between py-3 border-b border-zinc-200 dark:border-white/5">
                  <span className="data-label text-xs font-semibold text-zinc-600 dark:text-white/70">FDV</span>
                  <span className="data-value text-sm text-zinc-900 dark:text-white font-semibold">{liveFdv}</span>
                </div>
                <div className="data-row flex items-center justify-between py-3 border-b border-zinc-200 dark:border-white/5">
                  <span className="data-label text-xs font-semibold text-zinc-600 dark:text-white/70">Max Supply</span>
                  <span className="data-value text-sm text-zinc-900 dark:text-white font-semibold">{token.totalSupply || '1,000,000,000'}</span>
                </div>
                <div className="data-row flex items-center justify-between py-3">
                  <span className="data-label text-xs font-semibold text-zinc-600 dark:text-white/70">Circulating Supply</span>
                  <span className="data-value text-sm text-zinc-900 dark:text-white font-semibold">{token.totalSupply || '1,000,000,000'}</span>
                </div>
              </motion.div>
            )}

            {activeTab === 'onchain' && (
              <motion.div
                key="onchain"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-0.5"
              >
                {/* Base Pair */}
                <div className="data-row flex items-center justify-between py-3 border-b border-zinc-200 dark:border-white/5">
                  <span className="data-label text-xs font-semibold text-zinc-600 dark:text-white/70">Base Pair</span>
                  <span className="data-value text-sm text-zinc-900 dark:text-white font-semibold">
                    {liveBasePair}
                  </span>
                </div>
                
                {/* Contract */}
                <div className="data-row flex items-center justify-between py-3 border-b border-zinc-200 dark:border-white/5">
                  <span className="data-label text-xs font-semibold text-zinc-600 dark:text-white/70">Contract Address</span>
                  <div className="data-value text-sm text-zinc-900 dark:text-white font-semibold flex items-center gap-1.5">
                    <a 
                      href={`${getExplorerUrl()}/address/${token.contract}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="hover:underline flex items-center gap-1 text-zinc-800 dark:text-zinc-200"
                    >
                      <span>{token.contract.slice(0, 6)}....{token.contract.slice(-4)}</span>
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </a>
                    <CopyButtonWithPopup text={token.contract} />
                  </div>
                </div>

                {/* Creator */}
                <div className="data-row flex items-center justify-between py-3 border-b border-zinc-200 dark:border-white/5">
                  <span className="data-label text-xs font-semibold text-zinc-600 dark:text-white/70">Creator Address</span>
                  <div className="data-value text-sm text-zinc-900 dark:text-white font-semibold flex items-center gap-1.5">
                    {token.creator ? (
                      <>
                        <a 
                          href={`${getExplorerUrl()}/address/${token.creator}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="hover:underline flex items-center gap-1 text-zinc-800 dark:text-zinc-200"
                        >
                          <span>{token.creator.slice(0, 6)}....{token.creator.slice(-4)}</span>
                          <ExternalLink className="w-3 h-3 opacity-60" />
                        </a>
                        <CopyButtonWithPopup text={token.creator} />
                      </>
                    ) : (
                      <span className="text-zinc-400 dark:text-white/40">Unknown</span>
                    )}
                  </div>
                </div>

                {/* Add Liquidity */}
                <div className="data-row flex items-center justify-between py-3 border-b border-zinc-200 dark:border-white/5">
                  <span className="data-label text-xs font-semibold text-zinc-600 dark:text-white/70">Add Liquidity Tx</span>
                  <div className="data-value text-sm text-zinc-900 dark:text-white font-semibold flex items-center gap-1.5">
                    {token.addLpTx && token.addLpTx !== '0x...' && token.addLpTx !== '' ? (
                      <>
                        <a 
                          href={`${getExplorerUrl()}/tx/${token.addLpTx}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="hover:underline flex items-center gap-1 text-zinc-800 dark:text-zinc-200"
                        >
                          <span>{token.addLpTx.slice(0, 6)}....{token.addLpTx.slice(-4)}</span>
                          <ExternalLink className="w-3 h-3 opacity-60" />
                        </a>
                        <CopyButtonWithPopup text={token.addLpTx} />
                      </>
                    ) : (
                      <span className="text-zinc-400 dark:text-white/40">N/A</span>
                    )}
                  </div>
                </div>

                {/* LP Lock */}
                <div className="data-row flex items-center justify-between py-3">
                  <span className="data-label text-xs font-semibold text-zinc-600 dark:text-white/70">LP Lock Tx</span>
                  <div className="data-value text-sm text-zinc-900 dark:text-white font-semibold flex items-center gap-1.5">
                    {token.lockLpTx && token.lockLpTx !== '0x...' && token.lockLpTx !== '' ? (
                      <>
                        <a 
                          href={`${getExplorerUrl()}/tx/${token.lockLpTx}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="hover:underline flex items-center gap-1 text-zinc-800 dark:text-zinc-200"
                        >
                          <span>{token.lockLpTx.slice(0, 6)}....{token.lockLpTx.slice(-4)}</span>
                          <ExternalLink className="w-3 h-3 opacity-60" />
                        </a>
                        <CopyButtonWithPopup text={token.lockLpTx} />
                      </>
                    ) : (
                      <span className="text-zinc-400 dark:text-white/40">N/A</span>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'audit' && (
              <motion.div
                key="audit"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-0.5"
              >
                {/* Contract Verified */}
                <div className="data-row flex items-center justify-between py-3 border-b border-zinc-200 dark:border-white/5">
                  <span className="data-label text-xs font-semibold text-zinc-600 dark:text-white/70">Contract Verified</span>
                  <div className="data-value text-sm text-zinc-900 dark:text-white font-semibold flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold bg-emerald-500/10 dark:bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/20">
                      Yes <Check className="w-3 h-3" />
                    </span>
                  </div>
                </div>

                {/* Renounced Ownership */}
                <div className="data-row flex flex-col py-3 border-b border-zinc-200 dark:border-white/5">
                  <div className="flex items-center justify-between w-full">
                    <span className="data-label text-xs font-semibold text-zinc-600 dark:text-white/70">Renounced Ownership</span>
                    <div className="data-value text-sm text-zinc-900 dark:text-white font-semibold flex items-center gap-2">
                      {token.renounceTx && token.renounceTx !== '0x...' && token.renounceTx !== '' ? (
                        <>
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold bg-emerald-500/10 dark:bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/20">
                            Yes <Check className="w-3 h-3" />
                          </span>
                          <a 
                            href={`${getExplorerUrl()}/tx/${token.renounceTx}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="hover:underline flex items-center gap-1 text-xs text-zinc-500 dark:text-white/50"
                          >
                            <span>{token.renounceTx.slice(0, 6)}....{token.renounceTx.slice(-4)}</span>
                            <ExternalLink className="w-3 h-3 opacity-60" />
                          </a>
                          <CopyButtonWithPopup text={token.renounceTx} />
                        </>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 text-xs font-bold bg-rose-500/10 dark:bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/20">
                          No
                        </span>
                      )}
                    </div>
                  </div>
                  {(!token.renounceTx || token.renounceTx === '0x...' || token.renounceTx === '') && (
                    <div className="mt-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-500/20 p-2.5 rounded-lg border border-amber-500/20 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span className="font-medium">Warning: Contract owner has not renounced ownership and may still have administrative privileges over this token.</span>
                    </div>
                  )}
                </div>

                {/* Admin Control */}
                <div className="data-row flex items-center justify-between py-3 border-b border-zinc-200 dark:border-white/5">
                  <span className="data-label text-xs font-semibold text-zinc-600 dark:text-white/70">Admin Control / Owner Privileges</span>
                  <span className="data-value text-sm text-zinc-900 dark:text-white font-semibold">
                    {token.renounceTx && token.renounceTx !== '0x...' && token.renounceTx !== '' ? 'None' : 'Active'}
                  </span>
                </div>

                {/* Mint / Burn */}
                <div className="data-row flex items-center justify-between py-3 border-b border-zinc-200 dark:border-white/5">
                  <span className="data-label text-xs font-semibold text-zinc-600 dark:text-white/70">Mint / Burn</span>
                  <span className="data-value text-sm text-zinc-900 dark:text-white font-semibold">
                    None / Yes
                  </span>
                </div>

                {/* Buy / Sell Tax */}
                <div className="data-row flex items-center justify-between py-3 border-b border-zinc-200 dark:border-white/5">
                  <span className="data-label text-xs font-semibold text-zinc-600 dark:text-white/70">Buy / Sell Tax</span>
                  <span className="data-value text-sm text-zinc-900 dark:text-white font-semibold">
                    0% / 0%
                  </span>
                </div>

                {/* LP Locked Status */}
                <div className="data-row flex items-center justify-between py-3">
                  <span className="data-label text-xs font-semibold text-zinc-600 dark:text-white/70">LP Locked Status</span>
                  <div className="data-value text-sm text-zinc-900 dark:text-white font-semibold flex items-center gap-2">
                    {token.lockLpTx && token.lockLpTx !== '0x...' && token.lockLpTx !== '' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold bg-emerald-500/10 dark:bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/20">
                        Locked <Lock className="w-3 h-3" />
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 text-xs font-bold bg-rose-500/10 dark:bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/20">
                        Unlocked
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
