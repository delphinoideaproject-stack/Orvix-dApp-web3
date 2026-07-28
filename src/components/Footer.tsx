import React from 'react';
import { Page } from '../types';

export function Footer({ setCurrentPage }: { setCurrentPage: (p: Page) => void }) {
  return (
    <footer className="border-t border-zinc-200 dark:border-white/5 pt-12 pb-24 md:pb-12 w-full">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-10">
        
        {/* left: logo & tagline */}
        <div className="md:col-span-4 flex flex-col gap-4">
          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => setCurrentPage('HOME')}
          >
            <div className="w-8 h-8 bg-zinc-900 dark:bg-white flex items-center justify-center rounded-sm">
              <span className="text-white dark:text-black font-black text-[10px]">ORX</span>
            </div>
            <span className="font-black tracking-tighter uppercase text-lg text-zinc-900 dark:text-white">ORVIX</span>
          </div>
          <p className="text-sm text-zinc-500 dark:text-gray-400">
            Curated Discovery Infrastructure.
          </p>
        </div>

        {/* right: navigation */}
        <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8 text-sm">
          {/* Platform */}
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Platform</h3>
            <a href="#" className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
                <path d="M12 2.302l4.823 4.82-1.854 1.854L12 6.012 9.03 8.976l-1.853-1.854L12 2.302zm0 19.396l-4.823-4.82 1.854-1.854L12 17.988l2.97-2.964 1.853 1.854L12 21.698zm-6.096-7.37L3.02 11.442l2.884-2.886 1.853 1.855-1.03 1.031h-.002l1.03 1.03-1.851 1.856zm12.192 0l-1.851-1.856 1.03-1.03h-.002l1.03-1.031 1.853-1.855-2.884 2.886-2.884 2.885zM12 14.153l2.15-2.148-2.15-2.15-2.15 2.15 2.15 2.148z"/>
              </svg>
              BscScan
            </a>
            <a href="#" className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </a>
          </div>

          {/* Docs */}
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Docs</h3>
            <button onClick={() => setCurrentPage('DOCS')} className="text-left text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">Docs</button>
            <button onClick={() => setCurrentPage('WHITEPAPER')} className="text-left text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">Whitepaper</button>
          </div>

          {/* Legal */}
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Legal</h3>
            <button onClick={() => setCurrentPage('TERMS')} className="text-left text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">Terms of Use</button>
            <button onClick={() => setCurrentPage('PRIVACY')} className="text-left text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">Privacy</button>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Contact</h3>
            <button onClick={() => setCurrentPage('CONTACT')} className="text-left text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">Contact Us</button>
          </div>
        </div>
      </div>

      {/* bottom line */}
      <div className="max-w-7xl mx-auto px-6 mt-16 pt-6 border-t border-zinc-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-center md:items-start gap-4 text-xs font-medium text-zinc-500 dark:text-zinc-500">
        <span className="w-full text-left">© 2026 · Orvix Labs</span>
      </div>
    </footer>
  );
}

