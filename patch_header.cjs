const fs = require('fs');
let code = fs.readFileSync('src/pages/HomePage.tsx', 'utf8');

code = code.replace('Smarter Discovery<br/>', 'Smarter<br/>Discovery<br/>');

fs.writeFileSync('src/pages/HomePage.tsx', code);
