const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldNav = `      {/* FIXED MOBILE BOTTOM NAVIGATION */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 dark:bg-black/95 backdrop-blur-md border-t border-zinc-200 dark:border-white/5 z-40 px-6 py-2 pb-safe shadow-[0_-4px_24px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.4)]">
        <div className="max-w-md mx-auto flex justify-between items-center">
          
          {/* Home Tab */}
          <button
            onClick={() => handleNavigate('HOME')}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer relative",
              currentPage === 'HOME' ? "text-cyan-500 font-semibold" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            )}
          >
            {currentPage === 'HOME' && (
              <motion.div
                layoutId="bottomNavIndicator"
                className="absolute inset-0 bg-cyan-500/10 dark:bg-cyan-500/15 rounded-xl -z-10"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor" className="w-5 h-5 mb-0.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            <span className="text-[10px] tracking-wide font-medium">Home</span>
          </button>

          {/* Trade Tab */}
          <button
            onClick={() => handleNavigate('SWAP')}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer relative",
              currentPage === 'SWAP' ? "text-cyan-500 font-semibold" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            )}
          >
            {currentPage === 'SWAP' && (
              <motion.div
                layoutId="bottomNavIndicator"
                className="absolute inset-0 bg-cyan-500/10 dark:bg-cyan-500/15 rounded-xl -z-10"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor" className="w-5 h-5 mb-0.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
            <span className="text-[10px] tracking-wide font-medium">Trade</span>
          </button>

          {/* History Tab */}
          <button
            onClick={() => handleNavigate('HISTORY')}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer relative",
              currentPage === 'HISTORY' ? "text-cyan-500 font-semibold" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            )}
          >
            {currentPage === 'HISTORY' && (
              <motion.div
                layoutId="bottomNavIndicator"
                className="absolute inset-0 bg-cyan-500/10 dark:bg-cyan-500/15 rounded-xl -z-10"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor" className="w-5 h-5 mb-0.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <span className="text-[10px] tracking-wide font-medium">History</span>
          </button>

        </div>
      </div>`;

const newNav = `      {/* FIXED MOBILE BOTTOM NAVIGATION */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 dark:bg-black/95 backdrop-blur-md border-t border-zinc-200 dark:border-white/5 z-40 px-6 py-2 pb-safe shadow-[0_-4px_24px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.4)]">
        <div className="max-w-md mx-auto flex justify-between items-center">
          
          {/* Home Tab */}
          <button
            onClick={() => handleNavigate('HOME')}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer relative hover:scale-105 hover:brightness-110",
              currentPage === 'HOME' ? "font-semibold" : "text-zinc-500 dark:text-white/30"
            )}
          >
            {currentPage === 'HOME' && (
              <motion.div
                layoutId="bottomNavIndicator"
                className="absolute inset-0 bg-white/40 dark:bg-white/5 backdrop-blur-md border border-zinc-200 dark:border-white/10 rounded-xl -z-10"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor" className={cn("w-5 h-5 mb-0.5", currentPage === 'HOME' ? "stroke-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" : "")}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            <span className={cn("text-[10px] tracking-wide font-medium", currentPage === 'HOME' ? "text-cyan-400" : "text-zinc-500 dark:text-white/30")}>Home</span>
          </button>

          {/* Trade Tab */}
          <button
            onClick={() => handleNavigate('SWAP')}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer relative hover:scale-105 hover:brightness-110",
              currentPage === 'SWAP' ? "font-semibold" : "text-zinc-500 dark:text-white/30"
            )}
          >
            {currentPage === 'SWAP' && (
              <motion.div
                layoutId="bottomNavIndicator"
                className="absolute inset-0 bg-white/40 dark:bg-white/5 backdrop-blur-md border border-zinc-200 dark:border-white/10 rounded-xl -z-10"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor" className={cn("w-5 h-5 mb-0.5", currentPage === 'SWAP' ? "stroke-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" : "")}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
            <span className={cn("text-[10px] tracking-wide font-medium", currentPage === 'SWAP' ? "text-cyan-400" : "text-zinc-500 dark:text-white/30")}>Trade</span>
          </button>

          {/* History Tab */}
          <button
            onClick={() => handleNavigate('HISTORY')}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer relative hover:scale-105 hover:brightness-110",
              currentPage === 'HISTORY' ? "font-semibold" : "text-zinc-500 dark:text-white/30"
            )}
          >
            {currentPage === 'HISTORY' && (
              <motion.div
                layoutId="bottomNavIndicator"
                className="absolute inset-0 bg-white/40 dark:bg-white/5 backdrop-blur-md border border-zinc-200 dark:border-white/10 rounded-xl -z-10"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor" className={cn("w-5 h-5 mb-0.5", currentPage === 'HISTORY' ? "stroke-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" : "")}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <span className={cn("text-[10px] tracking-wide font-medium", currentPage === 'HISTORY' ? "text-cyan-400" : "text-zinc-500 dark:text-white/30")}>History</span>
          </button>

        </div>
      </div>`;

code = code.replace(oldNav, newNav);
fs.writeFileSync('src/App.tsx', code);
