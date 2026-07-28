/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Page, Token } from './types';
import { OrvixLogo } from './components/OrvixLogo';
import { HomePage } from './pages/HomePage';
import { TokenListPage } from './pages/NewAlphaPage';
import { ArchivePage } from './pages/ArchivePage';
import { HistoryPage } from './pages/HistoryPage';
import { SwapPage } from './pages/SwapPage';
import { SubmitWizard } from './pages/SubmitWizard';
import { CreatorPortalPage } from './pages/CreatorPortalPage';
import { StaticPage } from './pages/StaticPage';
import { TokenDetailPage } from './pages/TokenDetailPage';
import { SettingsModal } from './components/SettingsModal';
import { ProfilePage } from './pages/ProfilePage';
import { OrvixPromptModal } from './components/OrvixPromptModal';
import { ShareBottomSheet } from './components/ShareBottomSheet';
import { useAppKit, useAppKitAccount, useBalance, WalletModal, useWeb3 } from './lib/web3';
import { Footer } from './components/Footer';
import { ToastContainer, ToastMessage } from './components/Toast';
import { HybridBackground } from './components/HybridBackground';
import { Ticker } from './components/Ticker';
import { mockTokens, mockArchivedTokens, mockHistoryTokens } from './data';
import { 
  Home, 
  Sparkles, 
  Archive, 
  History, 
  ArrowUpDown, 
  Send, 
  FileText, 
  BookOpen, 
  Mail, 
  Shield, 
  Search, 
  Wallet, 
  Menu, 
  X,
  Settings,
  Compass,
  User
} from 'lucide-react';
import { cn } from './lib/utils';
import { Button } from './components/Button';
import { formatGlobalNumber } from './lib/formatNumber';


export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('HOME');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const currentNetwork = 'testnet';
  
  const { open: appKitOpen } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { isModalOpen, close, open: openWallet } = useWeb3();
  const { data: balanceData } = useBalance({ 
    address: address as `0x${string}`,
    query: { enabled: !!address }
  });
  const [bnbPrice, setBnbPrice] = useState<number>(600);

  useEffect(() => {
    fetch('https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT')
      .then(res => res.json())
      .then(data => {
        if (data && data.price) setBnbPrice(Number(data.price));
      })
      .catch(() => {});
  }, []);
  
  const formattedBalance = balanceData ? Number(balanceData.value) / (10 ** balanceData.decimals) : 0;
  const balanceInUsd = balanceData ? (formattedBalance * bnbPrice).toFixed(2) : '0.00';
  
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>(() => {
    return (localStorage.getItem('orvix_theme') as 'dark' | 'light' | 'system') || 'light';
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [promptModalOpen, setPromptModalOpen] = useState(false);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [globalShareToken, setGlobalShareToken] = useState<Token | null>(null);
  const [quickTradeToken, setQuickTradeToken] = useState<Token | null>(null);

  const handleQuickTrade = (token: Token) => {
    setQuickTradeToken(token);
    setSelectedToken(null);
    setCurrentPage('SWAP');
  };

  useEffect(() => {
    const handleToastEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      const message = customEvent.detail || 'Contract address copied to clipboard!';
      const id = Math.random().toString(36).substring(2, 9);
      setToasts(prev => [...prev, { id, message }]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 3000);
    };
    window.addEventListener('orvix-toast', handleToastEvent);

    const handleOpenShare = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setGlobalShareToken(customEvent.detail);
      }
    };
    window.addEventListener('orvix-open-share', handleOpenShare);

    return () => {
      window.removeEventListener('orvix-toast', handleToastEvent);
      window.removeEventListener('orvix-open-share', handleOpenShare);
    };
  }, []);

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => {
    localStorage.setItem('orvix_theme', theme);
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.classList.remove('dark');
    } else if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.classList.add('dark');
    } else {
      // system
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', prefersDark);
    }
  }, [theme]);

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    setSelectedToken(null);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage, selectedToken]);

  const navItems: { label: string; page: Page; icon: any }[] = [
    { label: 'Home', page: 'HOME', icon: Home },
    { label: 'History', page: 'HISTORY', icon: History },
    { label: 'Trade Terminal', page: 'SWAP', icon: ArrowUpDown },
    { label: 'Creator Portal', page: 'CREATOR_PORTAL', icon: Send },
    { label: 'Documentation', page: 'DOCS', icon: BookOpen },
    { label: 'Whitepaper', page: 'WHITEPAPER', icon: FileText },
    { label: 'Contact Us', page: 'CONTACT', icon: Mail },
    { label: 'Privacy & Policy', page: 'PRIVACY', icon: Shield },
  ];

  const renderPage = () => {
    if (selectedToken) {
      return (
        <TokenDetailPage 
          token={selectedToken} 
          onBack={() => setSelectedToken(null)} 
          onSwap={() => { setSelectedToken(null); handleNavigate("SWAP"); }}
        />
      );
    }

    switch (currentPage) {
      case 'HOME':
        return (
          <HomePage 
            setCurrentPage={handleNavigate} 
            searchQuery={searchQuery} 
            onSelectToken={setSelectedToken}
          />
        );
      case 'NEW_ALPHA':
      case 'DISCOVERY':
        return (
          <TokenListPage 
            tokens={mockTokens} 
            setCurrentPage={handleNavigate}
            searchQuery={searchQuery}
            onSelectToken={setSelectedToken}
          />
        );
      case 'PROFILE':
        return (
          <ProfilePage 
            setCurrentPage={handleNavigate}
            onSelectToken={setSelectedToken}
          />
        );
      case 'ARCHIVE':
        return (
          <ArchivePage 
            tokens={mockArchivedTokens} 
            setCurrentPage={handleNavigate}
            searchQuery={searchQuery}
            onSelectToken={setSelectedToken}
          />
        );
      case 'HISTORY':
        return (
          <HistoryPage 
            tokens={mockHistoryTokens} 
            searchQuery={searchQuery}
            setCurrentPage={handleNavigate}
            onSelectToken={setSelectedToken}
          />
        );
      case 'SWAP':
        return (
          <SwapPage 
            onModalOpenChange={setIsSwapModalOpen} 
            preselectedToken={quickTradeToken}
          />
        );
      case 'CREATOR_PORTAL':
        return (
          <CreatorPortalPage 
            walletConnected={isConnected}
            walletAddress={address}
            onNavigate={handleNavigate}
            onOpenWalletModal={openWallet}
          />
        );
      case 'SUBMIT':
        return (
          <SubmitWizard 
            walletConnected={isConnected}
            walletAddress={address}
            onOpenWalletModal={openWallet}
          />
        );
      case 'DOCS':
        return (
          <StaticPage title="Documentation">
            <p>Welcome to the Orvix Protocol documentation. Orvix is a deterministic discovery protocol for verified Web3 assets operating exclusively on AMM V2 BNB Chain.</p>
            <h2>Overview</h2>
            <p>We algorithmically identify, manually review, and present early-stage blockchain projects with guaranteed liquidity locking.</p>
          </StaticPage>
        );
      case 'WHITEPAPER':
        return (
          <StaticPage title="Whitepaper">
            <p>The thesis behind Orvix Labs and our approach to token curation on BNB Chain.</p>
            <h2>The Problem</h2>
            <p>The current landscape of token discovery is filled with noise and unverified contracts.</p>
            <h2>The Solution</h2>
            <p>A deterministic approach to contract verification and AMM V2 liquidity locking analysis.</p>
          </StaticPage>
        );
      case 'CONTACT':
        return (
          <StaticPage title="Contact Us">
            <p>Reach out to the Orvix curation team.</p>
            <p>Email: security@orvix.labs</p>
            <p>Telegram: @orvix_support</p>
          </StaticPage>
        );
      case 'PRIVACY':
        return (
          <StaticPage title="Privacy Policy">
            <p>We respect your privacy. Orvix does not track personal wallet activity beyond submitted application data.</p>
            <h2>Data Collection</h2>
            <p>We only store information explicitly provided during the token submission process on BNB Chain.</p>
          </StaticPage>
        );
      default:
        return <HomePage setCurrentPage={handleNavigate} searchQuery={searchQuery} onSelectToken={setSelectedToken} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen relative w-full overflow-x-hidden antialiased selection:bg-cyan-600 selection:text-white bg-[var(--bg)] text-[var(--text)] font-sans">
      <Ticker />
      <div className="flex flex-col flex-1">
        <HybridBackground />
        
        {/* TOP NAVIGATION (FROM HTML) */}
        <nav className="sticky top-[29px] z-[99] bg-white/80 dark:bg-[#050607]/80 backdrop-blur-md border-b border-zinc-200 dark:border-white/5">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavigate('HOME')}>
                <div className="w-8 h-8 bg-zinc-900 dark:bg-white flex items-center justify-center rounded-sm">
                  <span className="text-white dark:text-black font-black text-[10px]">ORX</span>
                </div>
                <span className="text-xl font-black tracking-tighter uppercase text-zinc-900 dark:text-white">ORVIX</span>
              </div>
              <div className="hidden md:flex gap-6 text-[10px] font-bold uppercase tracking-[0.2em]">
                <button onClick={() => handleNavigate('HOME')} className={cn("hover:text-zinc-900 dark:hover:text-white transition cursor-pointer", currentPage === 'HOME' ? "text-slate-900 font-bold dark:text-slate-100" : "text-zinc-500 dark:text-gray-400")}>Home</button>
                <button onClick={() => handleNavigate('DISCOVERY')} className={cn("hover:text-zinc-900 dark:hover:text-white transition cursor-pointer", (currentPage === 'DISCOVERY' || currentPage === 'NEW_ALPHA') ? "text-slate-900 font-bold dark:text-slate-100" : "text-zinc-500 dark:text-gray-400")}>Discovery</button>
                <button onClick={() => handleNavigate('SWAP')} className={cn("hover:text-zinc-900 dark:hover:text-white transition cursor-pointer", currentPage === 'SWAP' ? "text-slate-900 font-bold dark:text-slate-100" : "text-zinc-500 dark:text-gray-400")}>Trade</button>
                <button onClick={() => handleNavigate('HISTORY')} className={cn("hover:text-zinc-900 dark:hover:text-white transition cursor-pointer", currentPage === 'HISTORY' ? "text-slate-900 font-bold dark:text-slate-100" : "text-zinc-500 dark:text-gray-400")}>History</button>
                <button onClick={() => handleNavigate('PROFILE')} className={cn("hover:text-zinc-900 dark:hover:text-white transition cursor-pointer", currentPage === 'PROFILE' ? "text-slate-900 font-bold dark:text-slate-100" : "text-zinc-500 dark:text-gray-400")}>Profile</button>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSettingsOpen(true)}
                className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer p-2 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-white/5"
                aria-label="App Settings"
              >
                <Settings className="w-5 h-5" />
              </button>

              <button onClick={() => { console.log('Desktop wallet button clicked'); openWallet(); }} className="bg-zinc-800 text-zinc-100 hover:bg-zinc-900 border border-[#555555] shadow-sm dark:bg-zinc-800 dark:border-[#CCCCCC] dark:text-zinc-100 dark:hover:bg-zinc-700 px-6 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer z-50">
                {isConnected && balanceData ? (
                  <div className="flex items-center gap-2">
                    <span>${balanceInUsd}</span>
                  </div>
                ) : (
                  "CONNECT WALLET"
                )}
              </button>
            </div>
          </div>
        </nav>

        {/* RIGHT MAIN TERMINAL CONTENT AREA */}
        <main className="flex-1 flex flex-col justify-between overflow-x-hidden relative pb-24 md:pb-0">
          {/* Page View Container */}
          <AnimatePresence mode="wait">
            {renderPage()}
          </AnimatePresence>
          <Footer setCurrentPage={handleNavigate} />
        </main>
      </div>

      {/* FIXED MOBILE BOTTOM NAVIGATION */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-[#060709]/95 backdrop-blur-md border-t border-zinc-200/80 dark:border-white/10 rounded-t-2xl shadow-[0_-10px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_-10px_30px_rgba(0,0,0,0.5)] pb-safe">
        <div className="flex items-center justify-around h-16 relative px-2">
        
          {/* Home Tab */}
          <button
            onClick={() => handleNavigate('HOME')}
            className={cn(
              "flex flex-col items-center justify-center gap-1 w-16 h-12 transition-all cursor-pointer relative",
              currentPage === 'HOME' ? "text-zinc-950 dark:text-white" : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            )}
          >
            <Home className={cn("w-5 h-5 transition-transform duration-200", currentPage === 'HOME' ? "scale-110 stroke-[2.5]" : "stroke-[2]")} />
            <span className="text-[8.5px] font-bold uppercase tracking-wider text-center block truncate w-full">Home</span>
          </button>

          {/* Discovery Tab */}
          <button
            onClick={() => handleNavigate('DISCOVERY')}
            className={cn(
              "flex flex-col items-center justify-center gap-1 w-16 h-12 transition-all cursor-pointer relative",
              (currentPage === 'DISCOVERY' || currentPage === 'NEW_ALPHA') ? "text-zinc-950 dark:text-white" : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            )}
          >
            <Compass className={cn("w-5 h-5 transition-transform duration-200", (currentPage === 'DISCOVERY' || currentPage === 'NEW_ALPHA') ? "scale-110 stroke-[2.5]" : "stroke-[2]")} />
            <span className="text-[8.5px] font-bold uppercase tracking-wider text-center block truncate w-full">Discover</span>
          </button>

          {/* Trade Tab (Centered Floating Convex Button) */}
          <div className="relative flex flex-col items-center w-16 -mt-6 z-50">
            <button
              onClick={() => handleNavigate('SWAP')}
              className={cn(
                "flex items-center justify-center w-14 h-14 rounded-full transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95 duration-200 ring-4 ring-white dark:ring-[#060709]",
                currentPage === 'SWAP'
                  ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-zinc-950/30 dark:shadow-white/30"
                  : "bg-zinc-900 text-zinc-100 dark:bg-zinc-800 dark:text-zinc-200 shadow-zinc-950/20"
              )}
            >
              <ArrowUpDown className="w-5 h-5 stroke-[2.5]" />
            </button>
            <span className={cn(
              "text-[8.5px] font-black uppercase tracking-wider text-center block mt-1.5 transition-colors duration-200",
              currentPage === 'SWAP' ? "text-zinc-950 dark:text-white" : "text-zinc-400 dark:text-zinc-500"
            )}>
              Trade
            </span>
          </div>

          {/* History Tab */}
          <button
            onClick={() => handleNavigate('HISTORY')}
            className={cn(
              "flex flex-col items-center justify-center gap-1 w-16 h-12 transition-all cursor-pointer relative",
              currentPage === 'HISTORY' ? "text-zinc-950 dark:text-white" : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            )}
          >
            <History className={cn("w-5 h-5 transition-transform duration-200", currentPage === 'HISTORY' ? "scale-110 stroke-[2.5]" : "stroke-[2]")} />
            <span className="text-[8.5px] font-bold uppercase tracking-wider text-center block truncate w-full">History</span>
          </button>

          {/* Profile Tab */}
          <button
            onClick={() => handleNavigate('PROFILE')}
            className={cn(
              "flex flex-col items-center justify-center gap-1 w-16 h-12 transition-all cursor-pointer relative",
              currentPage === 'PROFILE' ? "text-zinc-950 dark:text-white" : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            )}
          >
            <User className={cn("w-5 h-5 transition-transform duration-200", currentPage === 'PROFILE' ? "scale-110 stroke-[2.5]" : "stroke-[2]")} />
            <span className="text-[8.5px] font-bold uppercase tracking-wider text-center block truncate w-full">Profile</span>
          </button>

        </div>
      </div>

      <SettingsModal 
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        theme={theme}
        setTheme={setTheme}
      />

      <OrvixPromptModal 
        isOpen={promptModalOpen}
        onClose={() => setPromptModalOpen(false)}
      />
      
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {globalShareToken && (
        <ShareBottomSheet 
          token={globalShareToken} 
          isOpen={!!globalShareToken} 
          onClose={() => setGlobalShareToken(null)} 
        />
      )}

      <WalletModal isOpen={isModalOpen} onClose={close} />
    </div>
  );
}
