const fs = require('fs');
let code = fs.readFileSync('src/components/Footer.tsx', 'utf8');

const searchLogo = `{/* left: logo */}
        <div 
          className="flex items-center gap-3 cursor-pointer" 
          onClick={() => setCurrentPage('HOME')}
        >
          <div className="w-7 h-7 bg-zinc-900 dark:bg-white flex items-center justify-center rounded-sm">
            <span className="text-white dark:text-black font-black text-[9px]">ORX</span>
          </div>
          <span className="font-black tracking-tighter uppercase text-sm text-zinc-900 dark:text-white">ORVIX</span>
        </div>`;

const replaceLogo = `{/* left: logo & tagline */}
        <div 
          className="flex flex-col gap-2 cursor-pointer" 
          onClick={() => setCurrentPage('HOME')}
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-zinc-900 dark:bg-white flex items-center justify-center rounded-sm">
              <span className="text-white dark:text-black font-black text-[9px]">ORX</span>
            </div>
            <span className="font-black tracking-tighter uppercase text-sm text-zinc-900 dark:text-white">ORVIX</span>
          </div>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500 dark:text-gray-500">
            ORVIX · Curated Discovery Infrastructure for BSC.
          </p>
        </div>`;

code = code.replace(searchLogo, replaceLogo);
fs.writeFileSync('src/components/Footer.tsx', code);
