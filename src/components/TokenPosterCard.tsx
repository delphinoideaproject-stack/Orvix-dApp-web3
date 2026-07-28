import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Token, Page } from '../types';
import { cn } from '../lib/utils';
import { formatGlobalNumber } from '../lib/formatNumber';
import { TokenLogo } from './TokenLogo';
import { Button } from './Button';
import { Star } from 'lucide-react';

interface TokenPosterCardProps {
  token: Token;
  index?: number;
  onNavigate?: (page: Page) => void;
  onSelect?: (token: Token) => void;
}

export const TokenPosterCard: React.FC<TokenPosterCardProps> = ({
  token,
  index = 0,
  onNavigate,
  onSelect
}) => {
  const isPositive = token.priceChange >= 0;

  const [isStarred, setIsStarred] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      const saved = localStorage.getItem('orvix_watchlist');
      if (saved) {
        const list = JSON.parse(saved);
        return Array.isArray(list) && list.includes(token.id);
      }
    } catch (_) {}
    return false;
  });

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
      window.dispatchEvent(new CustomEvent('orvix-watchlist-updated'));
    } catch (_) {}
  };

  useEffect(() => {
    const handleUpdate = () => {
      try {
        const saved = localStorage.getItem('orvix_watchlist');
        if (saved) {
          const list = JSON.parse(saved);
          setIsStarred(Array.isArray(list) && list.includes(token.id));
        } else {
          setIsStarred(false);
        }
      } catch (_) {}
    };
    window.addEventListener('orvix-watchlist-updated', handleUpdate);
    return () => window.removeEventListener('orvix-watchlist-updated', handleUpdate);
  }, [token.id]);

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
        boxShadow: "0 12px 30px -10px rgba(0,0,0,0.15)",
      }}
      className={cn(
        "border border-zinc-200 dark:border-zinc-800/80 rounded-none bg-zinc-100 dark:bg-zinc-950 hover:border-zinc-400 dark:hover:border-zinc-700 transition-all duration-300 flex flex-col aspect-[3/4] w-full overflow-hidden cursor-pointer group shadow-sm relative z-10"
      )}
    >
      {/* Background Cover Image or Abstract Gradient */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        {token.wallpaper ? (
          <img 
            src={token.wallpaper} 
            alt="" 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-zinc-200 to-zinc-300 dark:from-zinc-900 dark:to-zinc-950" />
        )}
        {/* Soft, rich overlay for high-contrast text rendering */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/20 dark:from-black/100 dark:via-black/60 dark:to-black/30" />
      </div>

      {/* Top Header Floating Badges */}
      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-20">
        {/* Logo and Symbol Row */}
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 max-w-[55%]">
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full overflow-hidden bg-zinc-900 flex items-center justify-center shrink-0">
            <TokenLogo tokenId={token.logo || token.id} className="w-full h-full object-contain" />
          </div>
          <span className="text-[9px] sm:text-xs font-bold text-white tracking-tight truncate pr-1.5">
            {token.symbol}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Price Change Percentage */}
          <span className={cn(
            "text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md border border-white/10 text-white font-mono shrink-0",
            isPositive 
              ? "bg-green-500/85" 
              : "bg-red-500/85"
          )}>
            {isPositive ? '+' : ''}{formatGlobalNumber(token.priceChange)}%
          </span>

          {/* Star Button */}
          <button
            onClick={toggleStar}
            className="p-1 sm:p-1.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 text-white transition-all cursor-pointer flex items-center justify-center hover:scale-105 active:scale-95"
            title={isStarred ? "Remove from Watchlist" : "Add to Watchlist"}
          >
            <Star className={cn("w-3 h-3 sm:w-3.5 sm:h-3.5 transition-colors", isStarred ? "text-amber-400 fill-amber-400" : "text-white")} />
          </button>
        </div>
      </div>

      {/* Bottom Content Area (TikTok overlay style) */}
      <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4 pt-10 bg-gradient-to-t from-black via-black/80 to-transparent z-10 flex flex-col justify-end min-h-[50%]">
        <div className="truncate">
          <h3 className="text-xs sm:text-sm md:text-base font-extrabold text-white tracking-tight leading-none truncate drop-shadow-sm">
            {token.name}
          </h3>
          <p className="text-[9px] sm:text-xs text-zinc-300 font-medium truncate mt-0.5 opacity-90">
            {token.pair}
          </p>
        </div>

        {/* Monospace Price Row */}
        <div className="mt-1.5 sm:mt-2">
          <div className="text-[8px] sm:text-[9px] uppercase font-bold tracking-widest text-zinc-400 opacity-80">Price</div>
          <div className="text-sm sm:text-base md:text-lg lg:text-xl font-extrabold text-emerald-400 font-mono tracking-tight leading-none tabular-nums mt-0.5">
            ${formatGlobalNumber(token.price)}
          </div>
        </div>

        {/* Listing Info & Trade Trigger */}
        <div className="mt-2 sm:mt-3 pt-2 border-t border-white/10 flex flex-col gap-1.5">
          <div className="text-[8px] sm:text-[9px] text-zinc-400 font-semibold uppercase tracking-wider">
            Listed {token.listedAt}
          </div>
          <div className="flex gap-1.5 w-full" onClick={e => e.stopPropagation()}>
            <Button
              variant="primary"
              size="sm"
              className="w-full justify-center text-[10px] sm:text-xs font-extrabold py-1 rounded-lg bg-white text-zinc-950 hover:bg-zinc-200 border-none shadow-md"
              onClick={() => onNavigate?.('SWAP')}
            >
              Trade Now
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const TokenPosterCardSkeleton: React.FC = () => {
  return (
    <div className="border border-zinc-200 dark:border-zinc-800/80 rounded-none bg-zinc-100 dark:bg-zinc-950 flex flex-col aspect-[3/4] w-full justify-between p-4 relative overflow-hidden animate-pulse">
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-200/50 via-zinc-100/30 to-zinc-200/10 dark:from-zinc-900/50 dark:via-zinc-950/30 dark:to-zinc-950/10" />
      
      <div className="flex justify-between w-full relative z-10">
        <div className="h-6 bg-zinc-300 dark:bg-zinc-800 rounded-full w-20" />
        <div className="h-6 bg-zinc-300 dark:bg-zinc-800 rounded-full w-12" />
      </div>

      <div className="space-y-3 relative z-10 w-full mt-auto">
        <div className="space-y-1.5">
          <div className="h-4 bg-zinc-300 dark:bg-zinc-800 rounded w-2/3" />
          <div className="h-3 bg-zinc-300 dark:bg-zinc-800 rounded w-1/3" />
        </div>
        <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800/50 space-y-2">
          <div className="h-2.5 bg-zinc-300 dark:bg-zinc-800 rounded w-1/4" />
          <div className="h-8 bg-zinc-300 dark:bg-zinc-800 rounded-lg w-full" />
        </div>
      </div>
    </div>
  );
};
