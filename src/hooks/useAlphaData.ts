import { useState, useEffect, useCallback } from 'react';
import { Token } from '../types';
import { mockTokens } from '../data';
import { ethers } from 'ethers';
import { ORVIX_CONFIG, getEffectiveRpcUrl } from '../contracts/config';

export interface UseAlphaDataResult {
  tokens: Token[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAlphaData(dataSource?: Token[]): UseAlphaDataResult {
  const initialBase = dataSource || mockTokens;
  const [tokens, setTokens] = useState<Token[]>(initialBase);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load project submissions from localStorage
      let submissionTokens: Token[] = [];
      if (typeof window !== 'undefined') {
        try {
          const rawSubmissions = localStorage.getItem('orvix_submissions');
          if (rawSubmissions) {
            const submissions = JSON.parse(rawSubmissions);
            if (Array.isArray(submissions)) {
              submissionTokens = submissions.map(sub => ({
                id: sub.id || `sub-${Math.random()}`,
                name: sub.name,
                symbol: sub.symbol,
                pair: `${sub.symbol.toUpperCase()}/USDT`,
                chain: 'BEP-20',
                price: '0.001',
                priceChange: 0,
                listedAt: 'Just now',
                contract: sub.contractAddress || '0x...',
                creator: sub.walletAddress || '0xDeployer',
                addLpTx: '0x...',
                renounceTx: '0x...',
                lockLpTx: '0x...',
                ammVersion: 'AMM V2',
                logo: sub.logoUrl || `https://picsum.photos/seed/${sub.symbol}/200/200`,
                wallpaper: `https://picsum.photos/seed/${sub.symbol}_bg/1200/400`,
                totalSupply: sub.totalSupply ? Number(sub.totalSupply).toLocaleString() : '100,000,000',
                marketCap: '$100,000',
                website: sub.website,
                x: sub.xUrl,
                telegram: sub.telegramUrl,
                github: sub.githubUrl,
                stories: []
              }));
            }
          }
        } catch (e) {
          console.error("Error reading submissions:", e);
        }
      }

      const cacheKey = 'orvix_onchain_alpha_cache_v4';
      const cached = typeof window !== 'undefined' ? localStorage.getItem(cacheKey) : null;
      let baseTokens = initialBase;
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            baseTokens = parsed;
          }
        } catch (e) {
          // ignore cache parse error
        }
      }

      // Merge base tokens with local submissions
      const existingIds = new Set(baseTokens.map(t => t.id));
      const filteredSubmissions = submissionTokens.filter(sub => !existingIds.has(sub.id));
      const mergedInitial = [...filteredSubmissions, ...baseTokens];
      setTokens(mergedInitial);

      let provider: ethers.JsonRpcProvider;
      try {
        provider = new ethers.JsonRpcProvider(getEffectiveRpcUrl());
        // Test provider connection
        await provider.getBlockNumber();
      } catch (rpcErr) {
        console.warn("RPC provider unreachable, using fallback token data with submissions:", rpcErr);
        setLoading(false);
        return;
      }

      const updatedTokens = await Promise.all(
        initialBase.map(async (token) => {
          try {
            if (!token.contract || !token.contract.startsWith('0x')) {
              return token;
            }
            const erc20 = new ethers.Contract(
              token.contract,
              [
                "function totalSupply() view returns (uint256)",
                "function decimals() view returns (uint8)",
                "function balanceOf(address) view returns (uint256)"
              ],
              provider
            );

            const [supplyRaw, decimalsRaw, burn1Raw, burn2Raw] = await Promise.all([
              erc20.totalSupply().catch(() => null),
              erc20.decimals().catch(() => 18),
              erc20.balanceOf("0x000000000000000000000000000000000000dEaD").catch(() => 0n),
              erc20.balanceOf("0x0000000000000000000000000000000000000000").catch(() => 0n)
            ]);

            let totalSupplyFormatted = token.totalSupply;
            let calculatedMarketCap = token.marketCap;

            if (supplyRaw !== null) {
              const dec = Number(decimalsRaw) || 18;
              const totalBig = BigInt(supplyRaw);
              const burnedBig = BigInt(burn1Raw || 0n) + BigInt(burn2Raw || 0n);
              const circulatingBig = totalBig > burnedBig ? totalBig - burnedBig : totalBig;

              const totalFormattedNum = Number(ethers.formatUnits(totalBig, dec));
              const circulatingFormattedNum = Number(ethers.formatUnits(circulatingBig, dec));

              totalSupplyFormatted = totalFormattedNum.toLocaleString('en-US', { maximumFractionDigits: 0 });

              const priceNum = parseFloat(token.price) || 0.01;
              const mcapNum = circulatingFormattedNum * priceNum;

              calculatedMarketCap = '$' + mcapNum.toLocaleString('en-US', { maximumFractionDigits: 0 });
            }

            return {
              ...token,
              totalSupply: totalSupplyFormatted,
              marketCap: calculatedMarketCap,
            };
          } catch (e) {
            console.error(`Error querying on-chain data for ${token.symbol}:`, e);
            return token;
          }
        })
      );

      // Merge on-chain updated base tokens with local submissions
      const updatedExistingIds = new Set(updatedTokens.map(t => t.id));
      const finalFilteredSubmissions = submissionTokens.filter(sub => !updatedExistingIds.has(sub.id));
      const finalMerged = [...finalFilteredSubmissions, ...updatedTokens];

      setTokens(finalMerged);
      if (typeof window !== 'undefined') {
        localStorage.setItem(cacheKey, JSON.stringify(updatedTokens));
      }
    } catch (err: any) {
      console.warn("Alpha on-chain fetch warning:", err?.message);
      // Do not block app with error state if RPC fails
    } finally {
      setLoading(false);
    }
  }, [dataSource]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    tokens,
    loading,
    error,
    refetch: fetchData
  };
}
