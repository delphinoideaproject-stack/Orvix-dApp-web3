import React, { useState, useEffect } from 'react';

export const Ticker = () => {
  const [utcTime, setUtcTime] = useState('');
  const [gas, setGas] = useState('12');
  const [tvl, setTvl] = useState('4.2');
  const [swaps, setSwaps] = useState('1204');

  useEffect(() => {
    const timer = setInterval(() => {
      setUtcTime(new Date().toISOString().substr(11, 8));
    }, 1000);
    setUtcTime(new Date().toISOString().substr(11, 8));
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const dataTimer = setInterval(() => {
      setGas((8 + Math.random() * 15).toFixed(0));
      setTvl((3.8 + Math.random() * 1.2).toFixed(1));
      setSwaps(Math.floor(800 + Math.random() * 800).toString());
    }, 3000);
    return () => clearInterval(dataTimer);
  }, []);

  const TickerItems = () => (
    <>
      <span className="px-8"><span className="text-zinc-900 dark:text-white">ORVIX</span> <span className="text-cyan-600 dark:text-cyan-400">▲ 2.4%</span></span>
      <span className="px-8">UTC <span className="text-zinc-900 dark:text-white font-mono">{utcTime}</span></span>
      <span className="px-8">LIVE POOLS <span className="text-zinc-900 dark:text-white">12</span> <span className="text-green-500 dark:text-green-400">●</span></span>
      <span className="px-8">TVL <span className="text-zinc-900 dark:text-white">${tvl}M</span> <span className="text-cyan-600 dark:text-cyan-400">▲ 1.8%</span></span>
      <span className="px-8">GAS <span className="text-zinc-900 dark:text-white">{gas} GWEI</span> <span className="text-yellow-500 dark:text-yellow-400">●</span></span>
      <span className="px-8">SWAPS <span className="text-zinc-900 dark:text-white">{swaps}</span> <span className="text-cyan-600 dark:text-cyan-400">▲ 3%</span></span>
      <span className="px-8">NEW ALPHA <span className="text-zinc-900 dark:text-white">● 6 signals</span></span>
      <span className="px-8">CHAIN <span className="text-zinc-900 dark:text-white">BSC</span></span>
    </>
  );

  return (
    <div className="sticky top-0 z-[100] h-[29px] bg-zinc-100 dark:bg-[#0a0b0d] border-b border-zinc-200 dark:border-white/5 flex items-center overflow-hidden w-full shrink-0">
      <div className="flex whitespace-nowrap animate-[marquee_40s_linear_infinite] text-[9px] font-bold tracking-widest uppercase text-zinc-500 dark:text-gray-500">
        <TickerItems />
        <TickerItems />
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};
