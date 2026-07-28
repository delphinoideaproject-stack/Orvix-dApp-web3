import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Page, Token } from '../types';
import { Button } from '../components/Button';
import { Download, AlertCircle, Plus, Star, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { exportTokensToCSV } from '../lib/csvUtils';
import { useAlphaData } from '../hooks/useAlphaData';
import { formatGlobalNumber } from '../lib/formatNumber';
import { TokenLogo } from '../components/TokenLogo';
import { cn } from '../lib/utils';
import { mockArchivedTokens, mockTokens } from '../data';

const SLIDER_DATA = [
  {
    title: "Deterministic Curation Engine",
    description: "Every contract is audited for owner renunciation and automated AMM V2 locked liquidity timers.",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=1200&auto=format&fit=crop"
  },
  {
    title: "Real-Time Security Matrix",
    description: "Continuous tracking of buy/sell taxes, gas optimizations, and honey-pot vulnerability logs.",
    image: "https://images.unsplash.com/photo-1644024541216-45b9a1a33edf?q=80&w=1200&auto=format&fit=crop"
  },
  {
    title: "High-Conviction Tracking",
    description: "Star any vetted token to instantly add it to your browser-cached secure Watchlist array.",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop"
  }
];

export function TokenListPage({ 
  tokens: initialTokens, 
  searchQuery = '',
  setCurrentPage,
  onSelectToken
}: { 
  tokens: Token[]; 
  searchQuery?: string;
  setCurrentPage?: (p: Page) => void;
  onSelectToken?: (t: Token) => void;
}) {
  const [activeTab, setActiveTab] = useState<'new-alpha' | 'archive' | 'watchlist'>('new-alpha');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [watchlistIds, setWatchlistIds] = useState<string[]>([]);

  // Synchronize watchlist items across active tab and storage
  useEffect(() => {
    const updateWatchlist = () => {
      try {
        const saved = localStorage.getItem('orvix_watchlist');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setWatchlistIds(parsed);
          }
        } else {
          setWatchlistIds([]);
        }
      } catch (_) {}
    };
    updateWatchlist();
    window.addEventListener('orvix-watchlist-updated', updateWatchlist);
    return () => window.removeEventListener('orvix-watchlist-updated', updateWatchlist);
  }, []);

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % SLIDER_DATA.length);
  };
  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + SLIDER_DATA.length) % SLIDER_DATA.length);
  };

  // Data loading logic with useAlphaData hook
  const { tokens, loading, error, refetch } = useAlphaData(initialTokens);

  // Search filter implementations
  const filteredNewAlpha = tokens.filter(t => 
    !searchQuery || 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.pair.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.contract.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredArchive = mockArchivedTokens.filter(t => 
    !searchQuery || 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.pair.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.contract.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Watchlist lookup
  const allAvailableTokens = [...tokens, ...mockArchivedTokens];
  const uniqueTokensMap = new Map<string, Token>();
  allAvailableTokens.forEach(t => uniqueTokensMap.set(t.id, t));
  const watchlistTokens = Array.from(uniqueTokensMap.values()).filter(t => watchlistIds.includes(t.id));

  const filteredWatchlist = watchlistTokens.filter(t => 
    !searchQuery || 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.pair.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.contract.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const emptySlotsCount = Math.max(0, 12 - filteredNewAlpha.length);

  const handleExportCSV = () => {
    if (activeTab === 'new-alpha') {
      exportTokensToCSV(filteredNewAlpha, 'New Alpha');
    } else if (activeTab === 'archive') {
      exportTokensToCSV(filteredArchive, 'Archive');
    } else {
      exportTokensToCSV(filteredWatchlist, 'Watchlist');
    }
  };

  const getExportCount = () => {
    if (activeTab === 'new-alpha') return filteredNewAlpha.length;
    if (activeTab === 'archive') return filteredArchive.length;
    return filteredWatchlist.length;
  };

  return (
    <div className="w-full">
      {/* Manual Slider with 3 pictures and Dot Indicators */}
      <div className="w-full aspect-[21/9] sm:h-56 relative overflow-hidden mb-8 border border-zinc-200 dark:border-zinc-800 bg-zinc-950">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0"
          >
            <img 
              src={SLIDER_DATA[currentSlide].image} 
              alt="" 
              className="w-full h-full object-cover opacity-60"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 flex flex-col justify-end p-5 sm:p-6 text-white">
              <h3 className="text-base sm:text-lg font-black uppercase tracking-tight mb-1">
                {SLIDER_DATA[currentSlide].title}
              </h3>
              <p className="text-[11px] sm:text-xs text-zinc-300 max-w-xl leading-relaxed">
                {SLIDER_DATA[currentSlide].description}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel manual navigation arrows */}
        <button 
          onClick={prevSlide}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center border-none transition cursor-pointer select-none z-10"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button 
          onClick={nextSlide}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center border-none transition cursor-pointer select-none z-10"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Carousel dot indicators */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {SLIDER_DATA.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={cn(
                "w-2 h-2 rounded-full border-none transition-all duration-300 cursor-pointer p-0",
                currentSlide === i 
                  ? "bg-white scale-110" 
                  : "bg-white/40 hover:bg-white/60"
              )}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* TikTok Style Centered Navigation Tabs */}
      <div className="flex justify-center items-center gap-10 md:gap-16 mt-2 mb-8 relative z-10 border-b border-zinc-200/50 dark:border-zinc-800/50 max-w-lg mx-auto pb-2.5">
        <button
          onClick={() => setActiveTab('new-alpha')}
          className={cn(
            "cursor-pointer transition-all duration-200 relative pb-2.5 group select-none bg-transparent border-none p-0 focus:outline-none text-sm sm:text-base font-bold tracking-wide",
            activeTab === 'new-alpha' 
              ? "text-zinc-950 dark:text-white" 
              : "text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400"
          )}
        >
          <span>New Alpha</span>
          {activeTab === 'new-alpha' && (
            <motion.div 
              layoutId="activeTabUnderline" 
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-950 dark:bg-white"
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab('archive')}
          className={cn(
            "cursor-pointer transition-all duration-200 relative pb-2.5 group select-none bg-transparent border-none p-0 focus:outline-none text-sm sm:text-base font-bold tracking-wide",
            activeTab === 'archive' 
              ? "text-zinc-950 dark:text-white" 
              : "text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400"
          )}
        >
          <span>Archive</span>
          {activeTab === 'archive' && (
            <motion.div 
              layoutId="activeTabUnderline" 
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-950 dark:bg-white"
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab('watchlist')}
          className={cn(
            "cursor-pointer transition-all duration-200 relative pb-2.5 group select-none bg-transparent border-none p-0 focus:outline-none text-sm sm:text-base font-bold tracking-wide",
            activeTab === 'watchlist' 
              ? "text-zinc-950 dark:text-white" 
              : "text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400"
          )}
        >
          <span>Watchlist</span>
          {activeTab === 'watchlist' && (
            <motion.div 
              layoutId="activeTabUnderline" 
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-950 dark:bg-white"
            />
          )}
        </button>
      </div>

      {/* Conditional Rendering: Error State */}
      {!loading && error && (
        <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-none flex items-center justify-between my-6">
          <div className="flex items-center gap-3 text-red-500">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div>
              <div className="font-semibold text-xs">Failed to load data</div>
              <div className="text-[10px] opacity-80">{error}</div>
            </div>
          </div>
          <Button size="sm" onClick={() => refetch()}>Retry</Button>
        </div>
      )}

      {/* Grid Container with 3 columns */}
      <div className="grid grid-cols-3 gap-[4px] md:gap-[6px] pb-12">
        {loading ? (
          <>
            <TikTokSkeletonCard />
            <TikTokSkeletonCard />
            <TikTokSkeletonCard />
          </>
        ) : (
          <>
            {activeTab === 'new-alpha' && (
              <>
                {filteredNewAlpha.length > 0 ? (
                  filteredNewAlpha.map((t, index) => (
                    <TikTokTokenCard 
                      key={`${t.id}-${index}`} 
                      index={index} 
                      token={t} 
                      setCurrentPage={setCurrentPage} 
                      onSelect={onSelectToken}
                    />
                  ))
                ) : null}

                {/* Conditional Rendering: Empty Slots for New Alpha */}
                {Array.from({ length: emptySlotsCount }).map((_, i) => (
                  <TikTokAvailableSlotCard 
                    key={`empty-slot-${i}`} 
                    index={filteredNewAlpha.length + i}
                    setCurrentPage={setCurrentPage} 
                  />
                ))}

                {/* Conditional Rendering: No search results */}
                {filteredNewAlpha.length === 0 && (
                  <div className="col-span-full text-center py-16 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                    <p className="text-zinc-500 text-xs font-bold">No tokens found matching your search.</p>
                  </div>
                )}
              </>
            )}

            {activeTab === 'archive' && (
              <>
                {filteredArchive.length > 0 ? (
                  filteredArchive.map((t, index) => (
                    <TikTokTokenCard 
                      key={`${t.id}-${index}`} 
                      index={index} 
                      token={t} 
                      setCurrentPage={setCurrentPage} 
                      onSelect={onSelectToken}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-16 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                    <p className="text-zinc-500 text-xs font-bold">No archived tokens found.</p>
                  </div>
                )}
              </>
            )}

            {activeTab === 'watchlist' && (
              <>
                {filteredWatchlist.length > 0 ? (
                  filteredWatchlist.map((t, index) => (
                    <TikTokTokenCard 
                      key={`${t.id}-${index}`} 
                      index={index} 
                      token={t} 
                      setCurrentPage={setCurrentPage} 
                      onSelect={onSelectToken}
                    />
                  ))
                ) : watchlistTokens.length === 0 ? (
                  <div className="col-span-full text-center py-16 border-2 border-dashed border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/20 dark:bg-zinc-950/20 flex flex-col items-center justify-center p-6">
                    <p className="text-zinc-400 dark:text-zinc-500 text-xs font-bold mb-1">Your watchlist is empty</p>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 max-w-xs text-center leading-relaxed">
                      Click the star icon on any token card to add it to your high-conviction watchlist.
                    </p>
                  </div>
                ) : (
                  <div className="col-span-full text-center py-16 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                    <p className="text-zinc-500 text-xs font-bold">No starred tokens match your search.</p>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Beautiful TikTok-Style Content Grid Card Component with persistent Watchlist Star
function TikTokTokenCard({
  token,
  index = 0,
  onSelect,
  setCurrentPage
}: {
  token: Token;
  index?: number;
  onSelect?: (token: Token) => void;
  setCurrentPage?: (p: Page) => void;
}) {
  const isPositive = token.priceChange >= 0;

  // Star logic linked with persistent localStorage array
  const [isStarred, setIsStarred] = useState(() => {
    try {
      const saved = localStorage.getItem('orvix_watchlist');
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) && parsed.includes(token.id);
      }
    } catch (_) {}
    return false;
  });

  useEffect(() => {
    const checkWatchlist = () => {
      try {
        const saved = localStorage.getItem('orvix_watchlist');
        if (saved) {
          const parsed = JSON.parse(saved);
          setIsStarred(Array.isArray(parsed) && parsed.includes(token.id));
        }
      } catch (_) {}
    };
    window.addEventListener('orvix-watchlist-updated', checkWatchlist);
    return () => window.removeEventListener('orvix-watchlist-updated', checkWatchlist);
  }, [token.id]);

  const toggleStar = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const saved = localStorage.getItem('orvix_watchlist');
      let list = saved ? JSON.parse(saved) : [];
      if (!Array.isArray(list)) list = [];
      
      let nextStarred = false;
      if (list.includes(token.id)) {
        list = list.filter((id: string) => id !== token.id);
        nextStarred = false;
        window.dispatchEvent(new CustomEvent('orvix-toast', { detail: `${token.symbol} removed from Watchlist` }));
      } else {
        list.push(token.id);
        nextStarred = true;
        window.dispatchEvent(new CustomEvent('orvix-toast', { detail: `${token.symbol} added to Watchlist` }));
      }
      localStorage.setItem('orvix_watchlist', JSON.stringify(list));
      setIsStarred(nextStarred);
      window.dispatchEvent(new Event('orvix-watchlist-updated'));
    } catch (_) {}
  };

  return (
    <motion.div
      onClick={() => onSelect?.(token)}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        ease: [0.16, 1, 0.3, 1],
        delay: Math.min(index, 8) * 0.05 
      }}
      whileHover={{ 
        y: -4,
        scale: 1.01,
        boxShadow: "0 12px 30px -10px rgba(0,0,0,0.06)",
      }}
      className="border border-zinc-200 dark:border-zinc-800/80 rounded-none bg-white dark:bg-zinc-950 hover:border-zinc-400 dark:hover:border-zinc-700 transition-all duration-300 flex flex-col aspect-[3/4] overflow-hidden cursor-pointer group shadow-sm relative"
    >
      {/* Cover Image Header */}
      <div className="w-full h-[25%] sm:h-[28%] relative overflow-hidden shrink-0 bg-zinc-100 dark:bg-zinc-900">
        {token.wallpaper ? (
          <img 
            src={token.wallpaper} 
            alt="" 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-cyan-500/10 to-blue-500/10 dark:from-cyan-950/20 dark:to-blue-950/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

        {/* Star Button */}
        <button
          onClick={toggleStar}
          className="absolute top-1 right-1 sm:top-2 sm:right-2 p-1 rounded-none bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border-none transition-all duration-200 cursor-pointer z-20 outline-none focus:outline-none"
          title={isStarred ? "Remove from Watchlist" : "Add to Watchlist"}
        >
          <Star className={cn("w-3 h-3 sm:w-3.5 sm:h-3.5 transition-all duration-200", isStarred ? "text-yellow-400 fill-yellow-400 scale-110" : "text-white/80 hover:text-white")} />
        </button>
      </div>

      {/* Circular Profile Overlap */}
      <div className="px-2 sm:px-4 relative h-3 sm:h-6 shrink-0 z-10">
        <div className="absolute -top-3 sm:-top-6 left-2 sm:left-4 rounded-none border border-white dark:border-zinc-950 bg-white dark:bg-zinc-900 p-0.5 shadow-md w-6 h-6 sm:w-12 sm:h-12 flex items-center justify-center overflow-hidden">
          <TokenLogo tokenId={token.logo || token.id} className="w-full h-full object-contain" />
        </div>
      </div>

      {/* Main Metadata Display & Actions */}
      <div className="p-1.5 sm:p-4 pt-0 sm:pt-1 flex flex-col flex-grow justify-between overflow-hidden">
        <div className="min-h-0 flex-grow flex flex-col justify-between">
          {/* Token Identification and Change Pill */}
          <div className="flex items-start justify-between gap-1">
            <div className="truncate flex-grow">
              <h3 className="text-[10px] sm:text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight truncate">
                {token.name}
              </h3>
              <p className="text-[8px] sm:text-xs text-zinc-500 dark:text-zinc-400 font-medium truncate">
                {token.symbol}
              </p>
            </div>
            <span className={cn(
              "text-[8px] sm:text-xs font-semibold px-1 sm:px-2 py-0.5 rounded-none shrink-0 tabular-nums font-mono",
              isPositive 
                ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400" 
                : "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400"
            )}>
              {isPositive ? '+' : ''}{formatGlobalNumber(token.priceChange)}%
            </span>
          </div>

          {/* Price Layout */}
          <div className="mt-1 sm:mt-2">
            <div className="text-[7px] sm:text-[10px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500 leading-none mb-0.5">Price</div>
            <div className="text-xs sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 font-mono tracking-tight tabular-nums truncate">
              ${formatGlobalNumber(token.price)}
            </div>
          </div>
        </div>

        <div className="shrink-0 mt-1">
          {/* Listing age */}
          <div className="text-[8px] sm:text-[11px] text-zinc-400 dark:text-zinc-500 font-medium mb-1 sm:mb-3">
            {token.listedAt}
          </div>

          {/* Custom CTA Actions */}
          <div className="flex items-center gap-1 sm:gap-2" onClick={e => e.stopPropagation()}>
            <Button
              variant="primary"
              size="sm"
              className="flex-1 justify-center text-[9px] sm:text-xs font-bold py-1 sm:py-2 rounded-none"
              onClick={() => setCurrentPage?.('SWAP')}
            >
              Trade
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 justify-center text-[9px] sm:text-xs font-semibold py-1 sm:py-2 rounded-none border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
              onClick={() => onSelect?.(token)}
            >
              Details
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Beautiful TikTok-Style Empty/Available Slot Card Component
function TikTokAvailableSlotCard({
  setCurrentPage,
  index = 0
}: {
  setCurrentPage?: (p: Page) => void;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        ease: [0.16, 1, 0.3, 1],
        delay: Math.min(index, 8) * 0.05 
      }}
      className="border-2 border-dashed border-zinc-200 dark:border-zinc-800/80 rounded-none bg-zinc-50/40 dark:bg-zinc-900/10 p-2 sm:p-5 flex flex-col justify-between aspect-[3/4] text-center shadow-sm hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors duration-300"
    >
      <div className="flex flex-col items-center justify-center flex-grow">
        <div className="w-6 h-6 sm:w-12 sm:h-12 bg-zinc-100 dark:bg-zinc-800/50 flex items-center justify-center mb-1.5 sm:mb-3">
          <span className="w-1.5 h-1.5 sm:w-3 sm:h-3 bg-zinc-300 dark:bg-zinc-600 animate-pulse" />
        </div>
        <div className="text-[9px] sm:text-xs font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-bold mb-0.5 sm:mb-1.5">
          Available Slot
        </div>
        <p className="text-[8px] sm:text-xs text-zinc-500 dark:text-zinc-400 max-w-[180px] leading-relaxed hidden sm:block">
          This slot is open for a new curated project.
        </p>
      </div>
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => setCurrentPage && setCurrentPage('CREATOR_PORTAL')}
        className="w-full flex items-center justify-center gap-1 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-600 py-1 sm:py-2 text-[9px] sm:text-xs rounded-none"
      >
        <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
        Submit
      </Button>
    </motion.div>
  );
}

// Beautiful TikTok-Style Skeleton Loading Component
function TikTokSkeletonCard() {
  return (
    <div className="border border-zinc-200 dark:border-zinc-800/80 rounded-none bg-white dark:bg-zinc-950 p-2 sm:p-4 flex flex-col aspect-[3/4] justify-between animate-pulse">
      <div className="h-full flex flex-col justify-between">
        <div>
          <div className="w-full h-[25%] sm:h-24 bg-zinc-100 dark:bg-zinc-900 rounded-none mb-2 sm:mb-3" />
          <div className="flex items-start justify-between gap-1 sm:gap-2">
            <div className="space-y-1 sm:space-y-2 flex-grow">
              <div className="h-2 sm:h-4 bg-zinc-100 dark:bg-zinc-900 rounded-none w-2/3" />
              <div className="h-1.5 sm:h-3 bg-zinc-100 dark:bg-zinc-900 rounded-none w-1/2" />
            </div>
            <div className="h-3 sm:h-5 bg-zinc-100 dark:bg-zinc-900 rounded-none w-8 sm:w-12" />
          </div>
          <div className="mt-2 sm:mt-4 space-y-1 sm:space-y-2">
            <div className="h-1 sm:h-2 bg-zinc-100 dark:bg-zinc-900 rounded-none w-1/4" />
            <div className="h-3 sm:h-6 bg-zinc-100 dark:bg-zinc-900 rounded-none w-1/2" />
          </div>
        </div>
        <div>
          <div className="h-2 bg-zinc-100 dark:bg-zinc-900 rounded-none w-1/3 mb-1.5 sm:mb-3" />
          <div className="flex gap-1 sm:gap-2">
            <div className="h-5 sm:h-9 bg-zinc-100 dark:bg-zinc-900 rounded-none flex-1" />
            <div className="h-5 sm:h-9 bg-zinc-100 dark:bg-zinc-900 rounded-none flex-1" />
          </div>
        </div>
      </div>
    </div>
  );
}
