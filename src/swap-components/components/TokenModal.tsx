import { useState, useMemo, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Search, Check, Loader2 } from 'lucide-react';
import { VERIFIED_TOKENS } from '../constants/contracts';
import type { TokenInfo } from '../types';
import { useTokenMetadata } from '../hooks/useTokenMetadata';

interface TokenModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (token: TokenInfo) => void;
  excludeAddress?: string;
  recentTokens: TokenInfo[];
  onAddRecent: (token: TokenInfo) => void;
}

export default function TokenModal({
  open,
  onClose,
  onSelect,
  excludeAddress,
  recentTokens,
  onAddRecent,
}: TokenModalProps) {
  const [search, setSearch] = useState('');
  const [importing, setImporting] = useState(false);
  const [importedToken, setImportedToken] = useState<TokenInfo | null>(null);
  const { fetchMetadata } = useTokenMetadata();

  const searchTrimmed = search.trim();
  const isContractAddress = /^0x[a-fA-F0-9]{40}$/i.test(searchTrimmed);

  // Auto detect metadata when contract address is entered into search bar
  useEffect(() => {
    if (!isContractAddress) {
      setImportedToken(null);
      setImporting(false);
      return;
    }

    let isMounted = true;
    setImporting(true);

    fetchMetadata(searchTrimmed).then((meta) => {
      if (!isMounted) return;
      setImporting(false);
      if (meta) {
        setImportedToken(meta);
      } else {
        // Fallback token object if metadata lookup fails
        setImportedToken({
          address: searchTrimmed,
          symbol: 'TOKEN',
          name: 'Custom Token',
          decimals: 18,
        });
      }
    });

    return () => {
      isMounted = false;
    };
  }, [searchTrimmed, isContractAddress, fetchMetadata]);

  const filteredVerified = useMemo(() => {
    return VERIFIED_TOKENS.filter(
      (t) =>
        t.address !== excludeAddress &&
        (search === '' ||
          t.symbol.toLowerCase().includes(search.toLowerCase()) ||
          t.name.toLowerCase().includes(search.toLowerCase()) ||
          t.address.toLowerCase().includes(search.toLowerCase()))
    );
  }, [search, excludeAddress]);

  const filteredRecent = useMemo(() => {
    return recentTokens.filter(
      (t) =>
        t.address !== excludeAddress &&
        (search === '' ||
          t.symbol.toLowerCase().includes(search.toLowerCase()) ||
          t.name.toLowerCase().includes(search.toLowerCase()) ||
          t.address.toLowerCase().includes(search.toLowerCase()))
    );
  }, [recentTokens, search, excludeAddress]);

  const handleSelect = useCallback(
    (token: TokenInfo) => {
      onAddRecent(token);
      onSelect(token);
      setSearch('');
      setImportedToken(null);
      onClose();
    },
    [onSelect, onAddRecent, onClose]
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[150] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0 bg-black/60" onClick={onClose} />
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="relative w-full max-w-md p-6 rounded-2xl border border-border bg-bg-secondary shadow-soft max-h-[80vh] flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Select Token</h2>
              <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Unified Search Bar */}
            <div className="relative mb-4">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, symbol, or paste address"
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/[0.03] border border-border focus:border-[#555555] dark:focus:border-[#CCCCCC] focus:outline-none text-sm transition-colors"
              />
              {search.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-1"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="overflow-y-auto flex-1 space-y-5 no-scrollbar">
              {/* Detected Token from pasted contract address */}
              {importing && (
                <div className="flex items-center justify-center py-6 gap-2 text-xs text-text-muted">
                  <Loader2 size={16} className="animate-spin text-accent-cyan" />
                  <span>Detecting token from address...</span>
                </div>
              )}

              {importedToken && !filteredVerified.some(t => t.address.toLowerCase() === importedToken.address.toLowerCase()) && (
                <div>
                  <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-2">Detected Token</p>
                  <div className="p-1 rounded-xl border border-[#555555] dark:border-[#CCCCCC] bg-accent-cyan/5">
                    <TokenRow token={importedToken} onSelect={handleSelect} />
                  </div>
                </div>
              )}

              {/* Verified tokens */}
              <div>
                <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-2">Verified Tokens</p>
                <div className="space-y-1">
                  {filteredVerified.map((t) => (
                    <TokenRow key={t.address} token={t} onSelect={handleSelect} />
                  ))}
                  {filteredVerified.length === 0 && !importedToken && !importing && (
                    <p className="text-xs text-text-muted py-2">No verified tokens match</p>
                  )}
                </div>
              </div>

              {/* Recent tokens */}
              {filteredRecent.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-2">Recent</p>
                  <div className="space-y-1">
                    {filteredRecent.map((t) => (
                      <TokenRow key={t.address} token={t} onSelect={handleSelect} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TokenRow({ token, onSelect }: { token: TokenInfo; onSelect: (t: TokenInfo) => void }) {
  return (
    <button
      onClick={() => onSelect(token)}
      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-hover hover:text-[#D1D5DB] transition-colors text-left group"
    >
      <div className="w-9 h-9 rounded-full bg-accent-navy/40 flex items-center justify-center overflow-hidden shrink-0">
        {token.logoURI ? (
          <img src={token.logoURI} alt={token.symbol} className="w-full h-full object-cover" />
        ) : (
          <span className="text-sm font-semibold">{token.symbol.slice(0, 2)}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium group-hover:text-[#D1D5DB] transition-colors">{token.symbol}</span>
          {token.verified && (
            <Check size={12} className="text-[#9CA3AF] drop-shadow-[0_0_8px_rgba(255,255,255,0.6)] shrink-0" />
          )}
        </div>
        <p className="text-xs text-text-secondary truncate group-hover:text-white/30 transition-colors">{token.name}</p>
      </div>
      <span className="text-xs text-text-muted">{token.decimals}d</span>
    </button>
  );
}
