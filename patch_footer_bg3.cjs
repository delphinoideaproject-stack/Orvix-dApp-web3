const fs = require('fs');
let code = fs.readFileSync('src/components/Footer.tsx', 'utf8');

code = code.replace("dark:bg-[#0a0b0d]", "dark:bg-black/60");

fs.writeFileSync('src/components/Footer.tsx', code);
