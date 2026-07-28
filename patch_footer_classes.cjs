const fs = require('fs');
let code = fs.readFileSync('src/components/Footer.tsx', 'utf8');

const searchLinks = `<div className="flex flex-wrap items-center justify-center gap-x-4 md:gap-x-6 gap-y-2 text-[10px] font-bold uppercase tracking-[0.1em]">
          <span className="text-zinc-500 dark:text-gray-500 text-[9px] tracking-[0.2em] mr-1 hidden sm:inline-block">Platform</span>
          <a href="#" className="text-zinc-600 dark:text-gray-400 hover:text-zinc-900 dark:hover:text-gray-200 transition-colors cursor-pointer">BscScan</a>
          <a href="#" className="text-zinc-600 dark:text-gray-400 hover:text-zinc-900 dark:hover:text-gray-200 transition-colors cursor-pointer">GitHub</a>
          
          <span className="text-zinc-400 dark:text-gray-600 mx-1 hidden sm:inline-block">|</span>
          
          <span className="text-zinc-500 dark:text-gray-500 text-[9px] tracking-[0.2em] mr-1 hidden sm:inline-block">Legal & Docs</span>`;

const replaceLinks = `<div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] font-bold uppercase tracking-[0.1em]">
          <span className="text-zinc-500 dark:text-gray-500 text-[9px] tracking-[0.2em] mr-1">Platform</span>
          <a href="#" className="text-zinc-600 dark:text-gray-400 hover:text-zinc-900 dark:hover:text-gray-200 transition-colors cursor-pointer">BscScan</a>
          <a href="#" className="text-zinc-600 dark:text-gray-400 hover:text-zinc-900 dark:hover:text-gray-200 transition-colors cursor-pointer">GitHub</a>
          
          <span className="text-zinc-400 dark:text-gray-600 mx-1">|</span>
          
          <span className="text-zinc-500 dark:text-gray-500 text-[9px] tracking-[0.2em] mr-1">Legal & Docs</span>`;

code = code.replace(searchLinks, replaceLinks);

fs.writeFileSync('src/components/Footer.tsx', code);
