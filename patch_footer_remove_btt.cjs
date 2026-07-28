const fs = require('fs');
let code = fs.readFileSync('src/components/Footer.tsx', 'utf8');

const btt = `        {/* right: back to top */}
        <div 
          onClick={scrollToTop}
          title="Back to top"
          className="flex items-center justify-center text-zinc-500 dark:text-gray-500 hover:text-zinc-900 dark:hover:text-gray-200 transition-all cursor-pointer p-1 hover:-translate-y-0.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="18 15 12 9 6 15"></polyline>
          </svg>
        </div>`;

code = code.replace(btt, '');
fs.writeFileSync('src/components/Footer.tsx', code);
