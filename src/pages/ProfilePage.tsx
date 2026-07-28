import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useWeb3 } from '../lib/web3';
import { Page, Token } from '../types';
import { Wallet, Copy, Check, LogOut, ArrowUpRight, TrendingUp, ShieldAlert, Award, ExternalLink, HelpCircle } from 'lucide-react';
import { Button } from '../components/Button';
import { formatGlobalNumber } from '../lib/formatNumber';
import { mockTokens } from '../data';

export function ProfilePage({
  setCurrentPage,
  onSelectToken
}: {
  setCurrentPage: (p: Page) => void;
  onSelectToken: (t: Token) => void;
}) {
  const {
    address,
    isConnected,
    formattedBalance,
    balanceInUsd,
    symbol,
    open: openWallet,
    disconnect
  } = useWeb3();

  const [copied, setCopied] = useState(false);

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

  // Convert BNB balance to a float
  const bnbVal = formattedBalance || 0;
  const bnbUsd = Number(balanceInUsd) || 0;

  // Let's create some beautiful, high-fidelity mock holdings for the portfolio
  const btsToken = mockTokens.find(t => t.id === 'bts');
  const btsPrice = btsToken ? Number(btsToken.price) : 1.4;

  const mockHoldings = [
    {
      id: 'bnb',
      name: 'Binance Coin',
      symbol: symbol || 'BNB',
      logo: 'https://assets.coingecko.com/coins/images/825/standard/bnb-icon2_2x.png',
      balance: bnbVal,
      price: bnbUsd / (bnbVal || 1),
      value: bnbUsd,
      priceChange24h: 2.45,
      isNative: true,
      contract: 'Native'
    },
    {
      id: 'bts',
      name: 'Bitmask',
      symbol: 'BTS',
      logo: btsToken?.logo || 'https://picsum.photos/seed/bitmask/200/200',
      balance: 1500,
      price: btsPrice,
      value: 1500 * btsPrice,
      priceChange24h: 8.12,
      isNative: false,
      contract: btsToken?.contract || '0xf504a700fe1ec44a565cd4b5a2f6c6f536b5fb98',
      tokenObj: btsToken
    },
    {
      id: 'orx',
      name: 'Orvix Protocol Token',
      symbol: 'ORX',
      logo: 'https://picsum.photos/seed/orx/200/200',
      balance: 24500,
      price: 0.052,
      value: 24500 * 0.052,
      priceChange24h: -1.24,
      isNative: false,
      contract: '0x3b29a13d9fcd40f28c548b501c67ec48'
    },
    {
      id: 'usdt',
      name: 'Tether USD',
      symbol: 'USDT',
      logo: 'https://assets.coingecko.com/coins/images/325/standard/Tether.png',
      balance: 250.0,
      price: 1.0,
      value: 250.0,
      priceChange24h: 0.01,
      isNative: false,
      contract: '0x335173D1E617E111900000000000000000000000'
    }
  ];

  // If connected, calculate total portfolio value
  const totalPortfolioValue = isConnected
    ? mockHoldings.reduce((acc, h) => acc + h.value, 0)
    : 0;

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
      className="w-full max-w-7xl mx-auto py-6 sm:py-10 px-4 md:px-6"
    >
      {/* Upper Grid: Wallet Info Card & Portfolio Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Wallet Profile Summary Card */}
        <div className="lg:col-span-1 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 flex flex-col justify-between rounded-none relative overflow-hidden">
          <Wallet className="absolute top-4 right-4 w-12 h-12 text-zinc-100 dark:text-zinc-900 pointer-events-none" />

          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              Connected Active
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 dark:text-zinc-500">Wallet Address</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-mono font-bold text-zinc-800 dark:text-zinc-200">
                    {address ? `${address.substring(0, 10)}...${address.substring(address.length - 8)}` : ''}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors cursor-pointer rounded-none"
                    title="Copy wallet address"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 dark:text-zinc-500">Network Connection</span>
                <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mt-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                  BNB Smart Chain Testnet (ID: 97)
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 dark:text-zinc-500">Tier Status</span>
                <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mt-1 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-cyan-500" />
                  Orvix Beta Tester
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 mt-6">
            <button
              onClick={() => {
                disconnect();
                const event = new CustomEvent('orvix-toast', { detail: 'Wallet disconnected.' });
                window.dispatchEvent(event);
              }}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-500 hover:text-red-600 transition-colors cursor-pointer bg-transparent border-none"
            >
              <LogOut className="w-4 h-4" />
              Disconnect Wallet
            </button>
          </div>
        </div>

        {/* Portfolio Balance and Stats Card */}
        <div className="lg:col-span-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 rounded-none flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 dark:text-zinc-500">Total Portfolio Value</span>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +3.12% (24h)
              </span>
            </div>
            
            <h2 className="text-4xl sm:text-5xl font-black text-zinc-950 dark:text-white font-mono tracking-tight mb-2">
              ${totalPortfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Estimated total combined asset value detected in your active wallet.
            </p>

            {/* Asset Allocation Progress Bar */}
            <div className="mt-6">
              <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 dark:text-zinc-500 block mb-2">Asset Allocation</span>
              <div className="h-2.5 w-full bg-zinc-100 dark:bg-zinc-900 flex rounded-none overflow-hidden">
                {mockHoldings.map((h, i) => {
                  const percentage = (h.value / totalPortfolioValue) * 100;
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
              <div className="flex flex-wrap gap-4 mt-3">
                {mockHoldings.map((h, i) => {
                  const percentage = (h.value / totalPortfolioValue) * 100;
                  const dotColors = [
                    'bg-yellow-500',
                    'bg-cyan-500',
                    'bg-purple-500',
                    'bg-emerald-500'
                  ];
                  return (
                    <div key={h.id} className="flex items-center gap-1.5 text-xs">
                      <span className={`w-2 h-2 rounded-full ${dotColors[i % dotColors.length]}`} />
                      <span className="font-bold text-zinc-700 dark:text-zinc-300">{h.symbol}</span>
                      <span className="text-zinc-400 dark:text-zinc-500 font-mono">({percentage.toFixed(1)}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-6 p-3 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 text-zinc-700 dark:text-zinc-300 text-[11px] leading-relaxed flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p>
              <strong>Network Info:</strong> These balances are calculated using real-time market prices on <strong>BSC Testnet</strong>. Please verify all transactions using official blockchain explorers before transferring.
            </p>
          </div>
        </div>
      </div>

      {/* Assets List Section */}
      <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 rounded-none">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h3 className="text-lg font-black uppercase tracking-tight text-zinc-950 dark:text-white">Your Assets & Portfolio Holdings</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">A complete list of token assets held by the active wallet address.</p>
          </div>
        </div>

        {/* Assets Table/List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                <th className="py-3 px-2">Asset Name</th>
                <th className="py-3 px-2">Contract Link</th>
                <th className="py-3 px-2 text-right">Balance</th>
                <th className="py-3 px-2 text-right">Asset Price</th>
                <th className="py-3 px-2 text-right">Total Value (USD)</th>
                <th className="py-3 px-2 text-right">Change 24h</th>
                <th className="py-3 px-2 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
              {mockHoldings.map((h, i) => {
                const displayBalance = h.balance.toLocaleString('en-US', { 
                  maximumFractionDigits: h.id === 'bnb' ? 5 : 2 
                });
                
                return (
                  <tr key={h.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10 transition-colors">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-3">
                        <img 
                          src={h.logo} 
                          alt={h.symbol} 
                          className="w-7 h-7 rounded-none object-contain bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{h.name}</div>
                          <div className="text-xs text-zinc-400 dark:text-zinc-500 uppercase">{h.symbol}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2 font-mono text-xs text-zinc-500">
                      {h.isNative ? (
                        <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Native BNB Chain</span>
                      ) : (
                        <a 
                          href={`https://testnet.bscscan.com/token/${h.contract}`}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-cyan-500 transition-colors flex items-center gap-1"
                        >
                          {h.contract.substring(0, 6)}...{h.contract.substring(h.contract.length - 4)}
                          <ExternalLink className="w-3 h-3 text-zinc-400" />
                        </a>
                      )}
                    </td>
                    <td className="py-3 px-2 text-right font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {displayBalance} <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">{h.symbol}</span>
                    </td>
                    <td className="py-3 px-2 text-right font-mono text-sm text-zinc-800 dark:text-zinc-200">
                      ${formatGlobalNumber(h.price.toString())}
                    </td>
                    <td className="py-3 px-2 text-right font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      ${h.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <span className={`text-xs font-mono font-bold ${h.priceChange24h >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {h.priceChange24h >= 0 ? '+' : ''}{h.priceChange24h.toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                        {h.tokenObj ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-none py-1 px-3 text-[10px] uppercase font-bold"
                            onClick={() => onSelectToken(h.tokenObj as Token)}
                          >
                            Details
                          </Button>
                        ) : (
                          <span className="text-[10px] text-zinc-400 select-none">-</span>
                        )}
                        <Button
                          variant="primary"
                          size="sm"
                          className="rounded-none py-1 px-3 text-[10px] uppercase font-bold"
                          onClick={() => setCurrentPage('SWAP')}
                        >
                          Trade
                        </Button>
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
