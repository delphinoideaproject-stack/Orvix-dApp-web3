with open('src/App.tsx', 'r') as f:
    content = f.read()

import re

old_nav = r'''<div className="md:hidden fixed bottom-6 inset-x-0 z-40 px-6 pb-safe flex justify-center pointer-events-none">
        <div className="flex gap-6 pointer-events-auto">
        
          
          {/\* Home Tab \*/}
          <button
            onClick=\{\(\) => handleNavigate\('HOME'\)\}
            className=\{cn\(
              "p-2 transition-all cursor-pointer relative hover:scale-110",
              currentPage === 'HOME' \? "text-slate-900 dark:text-slate-100" : "text-zinc-500 dark:text-zinc-400"
            \)\}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor" className="w-6 h-6 transition-all drop-shadow-md">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            
          </button>

          {/\* Trade Tab \*/}
          <button
            onClick=\{\(\) => handleNavigate\('SWAP'\)\}
            className=\{cn\(
              "p-2 transition-all cursor-pointer relative hover:scale-110",
              currentPage === 'SWAP' \? "text-slate-900 dark:text-slate-100" : "text-zinc-500 dark:text-zinc-400"
            \)\}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor" className="w-6 h-6 transition-all drop-shadow-md">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
            
          </button>

          {/\* History Tab \*/}
          <button
            onClick=\{\(\) => handleNavigate\('HISTORY'\)\}
            className=\{cn\(
              "p-2 transition-all cursor-pointer relative hover:scale-110",
              currentPage === 'HISTORY' \? "text-slate-900 dark:text-slate-100" : "text-zinc-500 dark:text-zinc-400"
            \)\}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor" className="w-6 h-6 transition-all drop-shadow-md">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            
          </button>

        </div>
      </div>'''

new_nav = r'''<div className="md:hidden fixed bottom-6 inset-x-0 z-40 px-6 pb-safe flex justify-center pointer-events-none">
        <div className="flex gap-2 pointer-events-auto bg-white/95 dark:bg-black/95 backdrop-blur-md shadow-lg border border-zinc-200 dark:border-white/10 rounded-full px-4 py-2">
        
          {/* Home Tab */}
          <button
            onClick={() => handleNavigate('HOME')}
            className={cn(
              "flex flex-col items-center justify-center gap-1 min-w-[72px] p-2 rounded-2xl transition-all cursor-pointer relative",
              currentPage === 'HOME' ? "text-slate-900 dark:text-slate-100" : "text-zinc-500 dark:text-zinc-400"
            )}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor" className="w-5 h-5 transition-all drop-shadow-md">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            <span className="text-[9px] uppercase tracking-wider font-bold">HOME</span>
          </button>

          {/* Trade Tab */}
          <button
            onClick={() => handleNavigate('SWAP')}
            className={cn(
              "flex flex-col items-center justify-center gap-1 min-w-[72px] p-2 rounded-2xl transition-all cursor-pointer relative",
              currentPage === 'SWAP' ? "text-slate-900 dark:text-slate-100" : "text-zinc-500 dark:text-zinc-400"
            )}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor" className="w-5 h-5 transition-all drop-shadow-md">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
            <span className="text-[9px] uppercase tracking-wider font-bold">TRADE</span>
          </button>

          {/* History Tab */}
          <button
            onClick={() => handleNavigate('HISTORY')}
            className={cn(
              "flex flex-col items-center justify-center gap-1 min-w-[72px] p-2 rounded-2xl transition-all cursor-pointer relative",
              currentPage === 'HISTORY' ? "text-slate-900 dark:text-slate-100" : "text-zinc-500 dark:text-zinc-400"
            )}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor" className="w-5 h-5 transition-all drop-shadow-md">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <span className="text-[9px] uppercase tracking-wider font-bold">HISTORY</span>
          </button>

        </div>
      </div>'''

content = re.sub(old_nav, new_nav, content)

with open('src/App.tsx', 'w') as f:
    f.write(content)
