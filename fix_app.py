import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Replace lines 270-376 with the reconstructed content
top = content.split('<div className="flex flex-col flex-1">')[0]

reconstructed = """<div className="flex flex-col flex-1">
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
                <button onClick={() => handleNavigate('HOME')} className={cn("hover:text-zinc-900 dark:hover:text-white transition cursor-pointer", currentPage === 'HOME' ? "text-slate-900 font-bold dark:text-slate-100" : "text-zinc-500 dark:text-gray-400")}>Projects</button>
                <button onClick={() => handleNavigate('SWAP')} className={cn("hover:text-zinc-900 dark:hover:text-white transition cursor-pointer", currentPage === 'SWAP' ? "text-slate-900 font-bold dark:text-slate-100" : "text-zinc-500 dark:text-gray-400")}>Trade</button>
                <button onClick={() => handleNavigate('CREATOR_PORTAL')} className={cn("hover:text-zinc-900 dark:hover:text-white transition cursor-pointer", currentPage === 'CREATOR_PORTAL' ? "text-slate-900 font-bold dark:text-slate-100" : "text-zinc-500 dark:text-gray-400")}>Submit</button>
                <button onClick={() => handleNavigate('DOCS')} className={cn("hover:text-zinc-900 dark:hover:text-white transition cursor-pointer", currentPage === 'DOCS' ? "text-slate-900 font-bold dark:text-slate-100" : "text-zinc-500 dark:text-gray-400")}>Docs</button>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSettingsOpen(true)}
                className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
                aria-label="App Settings"
              >
                <Settings className="w-4 h-4" />
              </button>

              <button onClick={() => { console.log('Desktop wallet button clicked'); openWallet(); }} className="bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-900 dark:text-white px-6 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer z-50">
                {isConnected && balanceData ? (
                  <div className="flex items-center gap-2">
                    <span>${balanceInUsd}</span>
                  </div>
                ) : (
                  "Connect Wallet"
                )}
              </button>
            </div>
          </div>
        </nav>

        {/* RIGHT MAIN TERMINAL CONTENT AREA */}
        <main className="flex-1 flex flex-col justify-between overflow-x-hidden relative">
          {/* Page View Container */}
          <AnimatePresence mode="wait">
            {renderContent()}
          </AnimatePresence>
        </main>
      </div>

      {/* FIXED MOBILE BOTTOM NAVIGATION */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 dark:bg-black/95 backdrop-blur-md border-t border-zinc-200 dark:border-white/5 z-40 px-6 py-2 pb-safe shadow-[0_-4px_24px_rgba(0,0,0,0.05)]">
        <div className="max-w-md mx-auto flex justify-between items-center">
          
          {/* Home Tab */}
          <button
            onClick={() => handleNavigate('HOME')}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer relative hover:scale-105",
              currentPage === 'HOME' ? "font-semibold text-slate-900 dark:text-slate-100" : "text-zinc-500 dark:text-white/40"
            )}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor" className="w-5 h-5 mb-0.5 transition-all">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            <span className="text-[10px] tracking-wide font-medium transition-colors">Home</span>
          </button>

          {/* Trade Tab */}
          <button
            onClick={() => handleNavigate('SWAP')}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer relative hover:scale-105",
              currentPage === 'SWAP' ? "font-semibold text-slate-900 dark:text-slate-100" : "text-zinc-500 dark:text-white/40"
            )}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor" className="w-5 h-5 mb-0.5 transition-all">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
            <span className="text-[10px] tracking-wide font-medium transition-colors">Trade</span>
          </button>

          {/* History Tab */}
          <button
            onClick={() => handleNavigate('HISTORY')}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer relative hover:scale-105",
              currentPage === 'HISTORY' ? "font-semibold text-slate-900 dark:text-slate-100" : "text-zinc-500 dark:text-white/40"
            )}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor" className="w-5 h-5 mb-0.5 transition-all">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <span className="text-[10px] tracking-wide font-medium transition-colors">History</span>
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
"""

with open('src/App.tsx', 'w') as f:
    f.write(top + reconstructed)
