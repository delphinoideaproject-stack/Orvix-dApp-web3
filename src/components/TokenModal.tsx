import React, { useState, useEffect, useRef } from 'react';
import { X, Search, Loader2, Check } from 'lucide-react';
import { Token } from '../types';
import { fetchTrustedTokenList } from '../lib/tokenMetadata';
import { getEffectiveRpcUrl } from '../contracts/config';
import { useWeb3 } from '../lib/web3';
import { mockTokens, mockArchivedTokens, mockHistoryTokens } from '../data';
import { ethers } from 'ethers';

interface TokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (token: Token) => void;
}

const verifiedTokensList: Token[] = [
  {
    id: 'bnb',
    name: 'BNB',
    symbol: 'BNB',
    contract: '0x0000000000000000000000000000000000000000',
    logo: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png',
    chain: 'BSC',
    pair: 'BNB/USD',
    price: '0.00',
    priceChange: 0,
    listedAt: '18d',
    creator: '',
    addLpTx: '', renounceTx: '', lockLpTx: '', ammVersion: 'AMM V2', totalSupply: '100000000'
  },
  {
    id: 'wbnb',
    name: 'Wrapped BNB',
    symbol: 'WBNB',
    contract: '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd',
    logo: 'https://assets.coingecko.com/coins/images/12591/small/binance-wrapped-BNB.png',
    chain: 'BSC',
    pair: 'WBNB/USD',
    price: '0.00',
    priceChange: 0,
    listedAt: '18d',
    creator: '',
    addLpTx: '', renounceTx: '', lockLpTx: '', ammVersion: 'AMM V2', totalSupply: '100000000'
  },
  {
    id: 'busd',
    name: 'Binance USD',
    symbol: 'BUSD',
    contract: '0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee',
    logo: 'https://assets.coingecko.com/coins/images/9576/small/BUSD.png',
    chain: 'BSC',
    pair: 'BUSD/USD',
    price: '0.00',
    priceChange: 0,
    listedAt: '18d',
    creator: '',
    addLpTx: '', renounceTx: '', lockLpTx: '', ammVersion: 'AMM V2', totalSupply: '100000000'
  },
  {
    id: 'usst',
    name: 'USST Token',
    symbol: 'USST',
    contract: '0x0b826aFC12380Cd138ED9e7211631033fa51716F',
    logo: 'https://assets.coingecko.com/coins/images/325/small/Tether.png',
    chain: 'BSC',
    pair: 'USST/USD',
    price: '0.00',
    priceChange: 0,
    listedAt: '18d',
    creator: '',
    addLpTx: '', renounceTx: '', lockLpTx: '', ammVersion: 'AMM V2', totalSupply: '100000000'
  },
  {
    id: 'trav',
    name: 'TRAV Token',
    symbol: 'TRAV',
    contract: '0xE844E1201df67D3c4aAA5656b2296a775C9F844A',
    logo: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&auto=format&fit=crop&q=80',
    chain: 'BSC',
    pair: 'TRAV/USD',
    price: '0.00',
    priceChange: 0,
    listedAt: '18d',
    creator: '',
    addLpTx: '', renounceTx: '', lockLpTx: '', ammVersion: 'AMM V2', totalSupply: '100000000'
  },
  {
    id: 'bts',
    name: 'Bitmask',
    symbol: 'BTS',
    contract: '0xf504a700fe1ec44a565cd4b5a2f6c6f536b5fb98',
    logo: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&auto=format&fit=crop&q=80',
    chain: 'BSC',
    pair: 'BTS/USD',
    price: '0.00',
    priceChange: 0,
    listedAt: '18d',
    creator: '',
    addLpTx: '', renounceTx: '', lockLpTx: '', ammVersion: 'AMM V2', totalSupply: '100000000'
  }
];

const recentTokensList = [verifiedTokensList[5], verifiedTokensList[3]]; // BTS and USST

export function TokenModal({ isOpen, onClose, onSelect }: TokenModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [tokens, setTokens] = useState<Token[]>(verifiedTokensList);
  const [loading, setLoading] = useState(false);
  const [loadingDynamic, setLoadingDynamic] = useState(false);
  const { provider } = useWeb3();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 200);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setDebouncedQuery('');
      setLoadingDynamic(false);
      setLoading(true);
      const loadList = async () => {
        try {
          let currentChainId = 56;
          if (provider) {
            const net = await provider.getNetwork();
            currentChainId = Number(net.chainId);
          }
          
          if (currentChainId === 97) {
            // Include verified and any mock tokens
            const allTokens = [...verifiedTokensList, ...mockTokens, ...mockArchivedTokens, ...mockHistoryTokens];
            const seen = new Set();
            const uniqueTokens = allTokens.filter(t => {
              if (seen.has(t.contract.toLowerCase())) return false;
              seen.add(t.contract.toLowerCase());
              return true;
            });
            setTokens(uniqueTokens);
            setLoading(false);
          } else {
            const list = await fetchTrustedTokenList().catch(() => []);
            const all = [...verifiedTokensList, ...list];
            const seen = new Set();
            const unique = all.filter(t => {
              if (seen.has(t.contract.toLowerCase())) return false;
              seen.add(t.contract.toLowerCase());
              return true;
            });
            setTokens(unique);
            setLoading(false);
          }
        } catch (err) {
          console.warn("API Error:", err?.message || err);
          setTokens(verifiedTokensList);
          setLoading(false);
        }
      };
      loadList();
    } else {
      setSearchQuery('');
      setDebouncedQuery('');
      setLoadingDynamic(false);
    }
  }, [isOpen, provider]);

  // Auto-detect when a user pastes a valid contract address into the search input
  useEffect(() => {
    const query = debouncedQuery.trim();
    const isAddress = /^0x[a-fA-F0-9]{40}$/i.test(query);

    if (!isAddress) return;

    const existing = tokens.some(t => t.contract.toLowerCase() === query.toLowerCase());
    if (existing) return;

    let isMounted = true;
    setLoadingDynamic(true);

    const resolveToken = async () => {
      try {
        const bscProvider = new ethers.JsonRpcProvider(getEffectiveRpcUrl());
        const contract = new ethers.Contract(
          query,
          [
            "function name() view returns (string)",
            "function symbol() view returns (string)",
            "function totalSupply() view returns (uint256)",
            "function decimals() view returns (uint8)"
          ],
          bscProvider
        );

        const [name, symbol, totalSupplyRaw, decimals] = await Promise.all([
          contract.name().catch(() => 'Imported Token'),
          contract.symbol().catch(() => 'TOKEN'),
          contract.totalSupply().catch(() => 0),
          contract.decimals().catch(() => 18)
        ]);

        const humanSupply = Number(ethers.formatUnits(totalSupplyRaw, decimals));

        const newToken: Token = {
          id: `custom-${query.toLowerCase()}`,
          name: name || 'Imported Token',
          symbol: symbol || 'TOKEN',
          pair: `${symbol || 'TOKEN'}/BNB`,
          chain: 'BSC',
          price: '0.00',
          priceChange: 0,
          listedAt: 'Now',
          contract: query,
          creator: '',
          addLpTx: '',
          renounceTx: '',
          lockLpTx: '',
          ammVersion: 'AMM V2',
          totalSupply: humanSupply.toString(),
          logo: ''
        };

        if (isMounted) {
          setTokens(prev => {
            if (prev.some(t => t.contract.toLowerCase() === query.toLowerCase())) return prev;
            return [newToken, ...prev];
          });
        }
      } catch (err) {
        console.error("Failed to auto-detect token", err);
        const fallbackToken: Token = {
          id: `custom-${query.toLowerCase()}`,
          name: 'Custom Token',
          symbol: 'TOKEN',
          pair: 'TOKEN/BNB',
          chain: 'BSC',
          price: '0.00',
          priceChange: 0,
          listedAt: 'Now',
          contract: query,
          creator: '',
          addLpTx: '',
          renounceTx: '',
          lockLpTx: '',
          ammVersion: 'AMM V2',
          totalSupply: '0',
          logo: ''
        };
        if (isMounted) {
          setTokens(prev => {
            if (prev.some(t => t.contract.toLowerCase() === query.toLowerCase())) return prev;
            return [fallbackToken, ...prev];
          });
        }
      } finally {
        if (isMounted) setLoadingDynamic(false);
      }
    };

    resolveToken();

    return () => {
      isMounted = false;
    };
  }, [debouncedQuery, tokens]);

  const handleClearSearch = () => {
    setSearchQuery('');
    setDebouncedQuery('');
    searchInputRef.current?.focus();
  };

  if (!isOpen) return null;

  const filteredTokens = tokens.filter(t => 
    t.name.toLowerCase().includes(debouncedQuery.toLowerCase()) || 
    t.symbol.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
    t.contract.toLowerCase().includes(debouncedQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-all animate-fade-in">
      <div className="bg-[#0b172a] w-full max-w-[440px] rounded-[24px] p-6 shadow-2xl flex flex-col max-h-[92vh] border border-[#1e3a5f]/40 text-white animate-scale-in">
        
        {/* Title */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white m-0">Select Token</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors cursor-pointer p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Unified Search Bar */}
        <div className="relative mb-5">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input 
            ref={searchInputRef}
            type="text" 
            placeholder="Search name, symbol, or paste contract address"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-10 py-3 bg-[#07101e] border border-[#1e3a5f]/30 rounded-xl text-xs text-white placeholder:text-zinc-500 focus:border-[#5cceff]/40 outline-none transition-all"
          />
          {searchQuery.length > 0 && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white cursor-pointer p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Content container */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 max-h-[420px] custom-scrollbar">
          
          {debouncedQuery.length === 0 && (
            <>
              {/* Verified Tokens */}
              <div>
                <div className="text-[10px] font-bold text-zinc-500 tracking-wider mb-2 uppercase">Verified Tokens</div>
                <div className="space-y-1">
                  {verifiedTokensList.map(token => (
                    <button
                      key={token.id}
                      onClick={() => onSelect(token)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#1e3a5f]/30 hover:text-[#D1D5DB] transition-colors cursor-pointer text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#07101e] flex items-center justify-center overflow-hidden shrink-0 border border-[#555555] dark:border-[#CCCCCC]">
                           {token.logo ? (
                             <img 
                               src={token.logo} 
                               alt={token.symbol} 
                               className="w-full h-full object-cover" 
                               onError={(e) => {
                                 (e.target as HTMLElement).style.display = 'none';
                               }}
                             />
                           ) : (
                             <span className="text-xs font-bold text-zinc-400">{token.symbol[0]}</span>
                           )}
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-sm text-white group-hover:text-[#D1D5DB] transition-colors">{token.symbol}</span>
                            <span className="w-3.5 h-3.5 bg-white/10 rounded-full flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 text-[#9CA3AF] drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
                            </span>
                          </div>
                          <span className="text-[11px] text-zinc-400 font-medium group-hover:text-white/30 transition-colors">{token.name}</span>
                        </div>
                      </div>
                      <div className="text-[11px] text-zinc-500 font-semibold">
                        {token.listedAt || '18d'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Section */}
              <div>
                <div className="text-[10px] font-bold text-zinc-500 tracking-wider mb-2 uppercase">Recent</div>
                <div className="space-y-1">
                  {recentTokensList.map(token => (
                    <button
                      key={`recent-${token.id}`}
                      onClick={() => onSelect(token)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#1e3a5f]/30 hover:text-[#D1D5DB] transition-colors cursor-pointer text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#07101e] flex items-center justify-center overflow-hidden shrink-0 border border-[#555555] dark:border-[#CCCCCC]">
                           {token.logo ? (
                             <img 
                               src={token.logo} 
                               alt={token.symbol} 
                               className="w-full h-full object-cover" 
                               onError={(e) => {
                                 (e.target as HTMLElement).style.display = 'none';
                               }}
                             />
                           ) : (
                             <span className="text-xs font-bold text-zinc-400">{token.symbol[0]}</span>
                           )}
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-sm text-white group-hover:text-[#D1D5DB] transition-colors">{token.symbol}</span>
                            <span className="w-3.5 h-3.5 bg-white/10 rounded-full flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 text-[#9CA3AF] drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
                            </span>
                          </div>
                          <span className="text-[11px] text-zinc-400 font-medium group-hover:text-white/30 transition-colors">{token.name}</span>
                        </div>
                      </div>
                      <div className="text-[11px] text-zinc-500 font-semibold">
                        {token.listedAt || '18d'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {debouncedQuery.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-zinc-500 tracking-wider mb-2 uppercase">Search Results</div>
              {loading || loadingDynamic ? (
                <div className="flex flex-col items-center justify-center py-8 text-zinc-400">
                  <Loader2 className="w-5 h-5 animate-spin text-[#5cceff] mb-1" />
                  <span className="text-[11px]">{loadingDynamic ? 'Detecting token contract...' : 'Searching...'}</span>
                </div>
              ) : filteredTokens.length > 0 ? (
                <div className="space-y-1">
                  {filteredTokens.map(token => (
                    <button
                      key={token.id}
                      onClick={() => onSelect(token)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#1e3a5f]/30 transition-colors cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#07101e] flex items-center justify-center overflow-hidden shrink-0 border border-[#555555] dark:border-[#CCCCCC]">
                           {token.logo ? (
                             <img 
                               src={token.logo} 
                               alt={token.symbol} 
                               className="w-full h-full object-cover" 
                               onError={(e) => {
                                 (e.target as HTMLElement).style.display = 'none';
                               }}
                             />
                           ) : (
                             <span className="text-xs font-bold text-zinc-400">{token.symbol[0]}</span>
                           )}
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-sm text-white">{token.symbol}</span>
                            {verifiedTokensList.some(vt => vt.symbol.toLowerCase() === token.symbol.toLowerCase()) && (
                              <span className="w-3.5 h-3.5 bg-[#5cceff]/10 rounded-full flex items-center justify-center">
                                <Check className="w-2.5 h-2.5 text-[#5cceff]" />
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-zinc-400 font-medium truncate max-w-[200px]">{token.name}</span>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end shrink-0">
                        <span className="text-xs font-mono text-[#5cceff] font-bold">{token.symbol}</span>
                        <span className="text-[9px] text-zinc-500 font-mono">{token.contract.substring(0, 6)}...{token.contract.substring(Math.max(6, token.contract.length - 4))}</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-zinc-500 text-xs">No tokens found</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
