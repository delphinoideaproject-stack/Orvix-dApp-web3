const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf8');

// Replace dark mode backgrounds with solid black where appropriate based on the user's "Background hitam" request
code = code.replace(/--color-bg-primary-val: #050607;/g, '--color-bg-primary-val: #000000;');
code = code.replace(/--bg: #050607;/g, '--bg: #000000;');
code = code.replace(/--color-bg-secondary-val: #0f1419;/g, '--color-bg-secondary-val: #0a0a0a;');
code = code.replace(/--bg2: #0f1419;/g, '--bg2: #0a0a0a;');

fs.writeFileSync('src/index.css', code);
