const fs = require('fs');
let code = fs.readFileSync('src/components/Footer.tsx', 'utf8');

code = code.replace(/dark:bg-\\[#0a0b0d\\]/g, 'dark:bg-black/60');
code = code.replace(/bg-zinc-50/g, ''); // User just wanted dark:bg-black/60 it seems, but let's keep bg-zinc-50 for light mode, actually let's leave light mode alone.

fs.writeFileSync('src/components/Footer.tsx', code);
