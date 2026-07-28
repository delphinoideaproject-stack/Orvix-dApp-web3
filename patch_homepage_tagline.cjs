const fs = require('fs');
let code = fs.readFileSync('src/pages/HomePage.tsx', 'utf8');

const search = `      {/* ORVIX LOGO + TAGLINE */}
      <section className="py-12 mt-12 border-t border-zinc-200 dark:border-white/5 flex flex-col items-center text-center">
        <div className="w-14 h-14 bg-zinc-100 dark:bg-white/5 rounded-full flex items-center justify-center border border-zinc-300 dark:border-white/10 mb-4">
          <span className="text-zinc-900 dark:text-white font-black text-lg tracking-tighter">ORX</span>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 dark:text-gray-500">
          ORVIX · Curated Discovery Infrastructure for BSC.
        </p>
      </section>`;

code = code.replace(search, '');
fs.writeFileSync('src/pages/HomePage.tsx', code);
