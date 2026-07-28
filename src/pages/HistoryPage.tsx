import React, { useState } from 'react';
import { Token, Page } from '../types';
import { ExternalLink, Search, X, Award, Globe, Link2, TrendingUp } from 'lucide-react';
import { getExplorerUrl } from '../contracts/config';
import { motion } from 'motion/react';

interface HistoryPageProps {
  tokens: Token[];
  searchQuery?: string;
  setCurrentPage?: (p: Page) => void;
  onSelectToken?: (t: Token) => void;
}

export function HistoryPage({ tokens, searchQuery = '' }: HistoryPageProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const activeSearch = localSearch || searchQuery;

  const filteredTokens = tokens.filter(t => 
    !activeSearch || 
    t.name.toLowerCase().includes(activeSearch.toLowerCase()) || 
    t.contract.toLowerCase().includes(activeSearch.toLowerCase()) ||
    t.symbol.toLowerCase().includes(activeSearch.toLowerCase())
  );

  return (
    <div className="w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2 tracking-tight">History</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Tokens that have graduated from Orvix New Alpha.</p>
        </div>
        <div className="flex items-center gap-2">
          {isSearchOpen ? (
            <div className="relative flex items-center animate-fade-in">
              <Search className="absolute left-3 w-4 h-4 text-zinc-400 pointer-events-none" />
              <input
                type="text"
                autoFocus
                placeholder="Search history..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-48 sm:w-64 bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 rounded-xl pl-9 pr-8 py-2 text-sm outline-none transition-all placeholder:text-zinc-400 font-sans text-zinc-900 dark:text-zinc-100 focus:border-[#555555] dark:focus:border-[#CCCCCC]"
              />
              <button
                onClick={() => {
                  setIsSearchOpen(false);
                  setLocalSearch('');
                }}
                className="absolute right-2 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsSearchOpen(true)}
              title="Search History"
              className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700/50 transition-all cursor-pointer flex items-center justify-center shadow-sm"
            >
              <Search className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5 pb-12">
        {filteredTokens.length > 0 ? (
          filteredTokens.map((t, index) => {
            const exitReason = t.exitType || 'Major Exchange';
            const bscscanUrl = `${getExplorerUrl()}/address/${t.contract}`;
            const dexscreenerUrl = `https://dexscreener.com/bsc/${t.contract}`;

            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: Math.min(index, 8) * 0.05 }}
                whileHover={{ y: -4, boxShadow: "0 12px 30px -10px rgba(0,0,0,0.06)" }}
                className="border border-zinc-200 dark:border-zinc-800/80 rounded-2xl bg-white dark:bg-zinc-950 p-5 flex flex-col justify-between h-[340px] relative z-10 transition-all duration-300 shadow-sm"
              >
                <div>
                  {/* Graduation Trophy/Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                      <Award className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono font-semibold">
                      Graduated {t.listedAt}
                    </span>
                  </div>

                  {/* Token Details */}
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight mb-1 truncate">
                    {t.name}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono font-semibold mb-3">
                    ({t.symbol})
                  </p>

                  {/* Status Badge */}
                  <div className="mb-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800">
                      {exitReason}
                    </span>
                  </div>
                </div>

                {/* External Portal / Links Area */}
                <div className="space-y-2 pt-4 border-t border-zinc-100 dark:border-zinc-900">
                  <a 
                    href={bscscanUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900/50 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors text-xs font-semibold"
                  >
                    <span className="flex items-center gap-2">
                      <Link2 className="w-3.5 h-3.5 text-zinc-400" />
                      View Contract
                    </span>
                    <ExternalLink className="w-3 h-3 text-zinc-400" />
                  </a>

                  <a 
                    href={bscscanUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900/50 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors text-xs font-semibold"
                  >
                    <span className="flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-zinc-400" />
                      Project Portal
                    </span>
                    <ExternalLink className="w-3 h-3 text-zinc-400" />
                  </a>

                  <a 
                    href={dexscreenerUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900/50 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors text-xs font-semibold"
                  >
                    <span className="flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5 text-zinc-400" />
                      Analytics Pair
                    </span>
                    <ExternalLink className="w-3 h-3 text-zinc-400" />
                  </a>
                </div>
              </motion.div>
            );
          })
        ) : activeSearch ? (
          <div className="col-span-full py-20 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl bg-zinc-50/50 dark:bg-zinc-900/10">
            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-sans">
              No history entries found matching your search.
            </p>
          </div>
        ) : (
          <div className="col-span-full py-20 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl bg-zinc-50/50 dark:bg-zinc-900/10">
            <p className="text-sm text-zinc-400 dark:text-zinc-500 font-medium font-sans">
              No history entries yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
