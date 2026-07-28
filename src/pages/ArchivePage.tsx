import React, { useState } from 'react';
import { Page, Token } from '../types';
import { Search, X } from 'lucide-react';
import { TokenPosterCard } from '../components/TokenPosterCard';

interface ArchivePageProps {
  tokens: Token[];
  searchQuery?: string;
  setCurrentPage?: (p: Page) => void;
  onSelectToken?: (t: Token) => void;
}

export function ArchivePage({
  tokens,
  searchQuery = '',
  setCurrentPage,
  onSelectToken
}: ArchivePageProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const activeSearch = localSearch || searchQuery;

  const filteredTokens = tokens.filter(t =>
    !activeSearch ||
    t.name.toLowerCase().includes(activeSearch.toLowerCase()) ||
    t.pair.toLowerCase().includes(activeSearch.toLowerCase()) ||
    t.contract.toLowerCase().includes(activeSearch.toLowerCase())
  );

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-3 tracking-tight">Archive</h1>
          <p className="text-zinc-600 dark:text-zinc-400 w-full whitespace-pre-line">
            Tokens that have completed their time in New Alpha.{"\n"}Still active. Still tradeable.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isSearchOpen ? (
            <div className="relative flex items-center animate-fade-in">
              <Search className="absolute left-3 w-4 h-4 text-zinc-400 pointer-events-none" />
              <input
                type="text"
                autoFocus
                placeholder="Search archive..."
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
              title="Search Archive"
              className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700/50 transition-all cursor-pointer flex items-center justify-center shadow-sm"
            >
              <Search className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5 pb-12">
        {filteredTokens.length > 0 ? (
          filteredTokens.map((t, index) => (
            <TokenPosterCard 
              key={t.id}
              token={t}
              index={index}
              onSelect={onSelectToken}
              onNavigate={setCurrentPage}
            />
          ))
        ) : activeSearch ? (
          <div className="col-span-full py-20 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl bg-zinc-50/50 dark:bg-zinc-900/10">
            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-sans">
              No archived tokens found matching your search.
            </p>
          </div>
        ) : (
          <div className="col-span-full py-20 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl bg-zinc-50/50 dark:bg-zinc-900/10">
            <p className="text-sm text-zinc-400 dark:text-zinc-500 font-medium font-sans">
              No archived tokens yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
