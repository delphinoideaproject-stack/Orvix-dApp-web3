const fs = require('fs');
let code = fs.readFileSync('src/components/Footer.tsx', 'utf8');

const search = `        {/* right: back to top */}
        <button 
          onClick={scrollToTop}
          className="text-[9px] font-bold tracking-[0.2em] uppercase text-zinc-600 dark:text-[#4b5563] border border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/20 hover:text-zinc-900 dark:hover:text-[#e5e7eb] px-5 py-1.5 rounded-full transition-all cursor-pointer hidden md:block"
        >
          ↑ Back to Top
        </button>`;

const replacement = `        {/* right: back to top */}
        <div 
          onClick={scrollToTop}
          title="Back to top"
          className="flex items-center justify-center text-zinc-500 dark:text-gray-500 hover:text-zinc-900 dark:hover:text-gray-200 transition-all cursor-pointer p-1 hover:-translate-y-0.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="18 15 12 9 6 15"></polyline>
          </svg>
        </div>`;

code = code.replace(search, replacement);
fs.writeFileSync('src/components/Footer.tsx', code);
