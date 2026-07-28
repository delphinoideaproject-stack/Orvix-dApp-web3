import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  ShieldCheck, 
  Layers, 
  Lock, 
  Zap, 
  ChevronDown, 
  ChevronUp, 
  Wallet, 
  Search, 
  Eye, 
  Coins 
} from 'lucide-react';
import { Page, Token } from '../types';

export function HomePage({ 
  setCurrentPage,
  onSelectToken 
}: { 
  setCurrentPage: (p: Page) => void;
  searchQuery?: string;
  onSelectToken?: (t: Token) => void;
}) {
  // FAQ state
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  // Pillar points
  const pillars = [
    {
      icon: <Layers className="w-6 h-6 text-zinc-800 dark:text-zinc-200" />,
      title: 'AMM V2 Aggregation',
      description: 'Aggregates depth across active pools on the BNB Chain, routing swaps seamlessly to achieve minimal slippage and optimal pricing.'
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-zinc-800 dark:text-zinc-200" />,
      title: 'Deterministic Contract Auditing',
      description: 'Instant automated code parsing to check for honeypots, transfer restrictions, blacklist capabilities, and minting functions.'
    },
    {
      icon: <Lock className="w-6 h-6 text-zinc-800 dark:text-zinc-200" />,
      title: 'Locked Liquidity Verification',
      description: 'Continuous monitoring of liquidity locker contracts and burn events to verify developer LP lock terms and duration.'
    },
    {
      icon: <Zap className="w-6 h-6 text-zinc-800 dark:text-zinc-200" />,
      title: 'Fast & Low-Cost Trading',
      description: 'Powered by the speed of the BNB Chain, letting you execute instant peer-to-peer trades at a fraction of the cost of other chains.'
    }
  ];

  // How it works steps
  const steps = [
    {
      step: '01',
      icon: <Wallet className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />,
      title: 'Connect Wallet',
      description: 'Connect your standard Web3 wallet secure and non-custodially on the BNB Chain.'
    },
    {
      step: '02',
      icon: <Search className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />,
      title: 'Discover New Assets',
      description: 'Explore verified, real-time listings parsed by our automated scanning engines.'
    },
    {
      step: '03',
      icon: <Eye className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />,
      title: 'Analyze Token',
      description: 'Inspect contract security parameters, creator wallets, and verified LP lock durations.'
    },
    {
      step: '04',
      icon: <Coins className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />,
      title: 'Swap Instantly',
      description: 'Trade secure assets instantly through aggregated AMM liquidity pools.'
    }
  ];

  // FAQ items
  const faqs = [
    {
      q: 'What is Orvix?',
      a: 'Orvix is an advanced token discovery and AMM V2 aggregation platform on the BNB Chain. We specialize in scanning, verifying, and routing trades for newly-listed tokens, providing tools like deterministic contract auditing and locked liquidity verifiers.'
    },
    {
      q: 'How does AMM aggregation work?',
      a: 'Our aggregation engine scans liquidity levels across multiple AMM V2 pools on the BNB Chain. When you initiate a swap, the protocol automatically selects the most efficient routing path, maximizing your output and mitigating price impact.'
    },
    {
      q: 'Is Orvix non-custodial?',
      a: 'Absolutely. Orvix is 100% decentralized and non-custodial. All operations happen directly through your active Web3 wallet, and your private keys are never accessed or stored.'
    },
    {
      q: 'Which wallets are supported?',
      a: 'Through our unified AppKit integration, we support hundreds of Web3 wallets, including MetaMask, Trust Wallet, Binance Web3 Wallet, Coinbase Wallet, SafePal, and Rainbow.'
    },
    {
      q: 'Is liquidity verified?',
      a: 'Yes. Our scanners cross-reference pool addresses with popular LP locker protocols and verify burn address balances. This ensures only contracts with authentic locked liquidity get high-rank visibility in our discovery platform.'
    }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-16 space-y-24">
      
      {/* HERO SECTION */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full flex flex-col justify-center min-h-[40vh] py-6"
      >
        <div className="max-w-4xl pt-4">
          {/* Curated Discovery Tag */}
          <div className="inline-flex items-center gap-3 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">Curated Discovery Infrastructure</span>
          </div>
          
          {/* Headline */}
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[1.05] mb-6 text-zinc-900 dark:text-white">
            Smarter<br/>Discovery<br/>
            <span className="text-zinc-400 dark:text-zinc-600">Starts Here</span>
          </h1>
          
          {/* Description */}
          <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 max-w-xl leading-relaxed mb-8">
            Built for discovering project launches, identifying early crypto assets, and executing efficient trades through intelligent AMM V2 aggregation. Experience deterministic contract auditing and locked liquidity assurance on BNB Chain.
          </p>

          {/* CTA */}
          <div className="flex flex-wrap gap-4 items-center">
            <button
              onClick={() => setCurrentPage('NEW_ALPHA')}
              className="group cursor-pointer font-bold tracking-widest uppercase text-xs px-6 py-3.5 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 flex items-center gap-3 rounded-none shadow-md hover:shadow-lg hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all duration-300 border-none outline-none focus:outline-none"
            >
              <span>Discover & Launch</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* WHY ORVIX SECTION */}
      <section className="space-y-12">
        <div className="max-w-2xl">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 block mb-2">Protocol Architecture</span>
          <h2 className="text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">Why Orvix</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
            A comprehensive suite of deterministic scanning utilities and aggregated liquidity routers designed for modern DeFi environments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {pillars.map((p, index) => (
            <div 
              key={index}
              className="py-2 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 flex items-center justify-start text-zinc-800 dark:text-zinc-200">
                  {p.icon}
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">{p.title}</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{p.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="space-y-12">
        <div className="max-w-2xl">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 block mb-2">User Journey</span>
          <h2 className="text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">How It Works</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
            From establishing connection to executing swap transactions on verified pools.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((s, index) => (
            <div 
              key={index}
              className="py-2 flex flex-col justify-between relative"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 flex items-center justify-start text-zinc-700 dark:text-zinc-300">
                    {s.icon}
                  </div>
                  <div className="text-2xl font-black font-mono text-zinc-300 dark:text-zinc-800 select-none">
                    {s.step}
                  </div>
                </div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">{s.title}</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="space-y-12">
        <div className="max-w-2xl">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 block mb-2">Common Questions</span>
          <h2 className="text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">Frequently Asked Questions</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
            Everything you need to know about navigating the Orvix Curation Platform.
          </p>
        </div>

        <div className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60">
          {faqs.map((faq, index) => {
            const isOpen = expandedFaq === index;
            return (
              <div key={index} className="transition-all duration-200">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left py-5 flex items-center justify-between gap-4 font-bold text-zinc-900 dark:text-zinc-100 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                >
                  <span className="text-sm sm:text-base tracking-tight">{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-zinc-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-zinc-500" />
                  )}
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pb-5 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-4xl">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
