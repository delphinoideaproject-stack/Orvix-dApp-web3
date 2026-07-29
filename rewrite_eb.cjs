const fs = require('fs');
let content = fs.readFileSync('src/components/ErrorBoundary.tsx', 'utf-8');

content = content.replace("Terjadi Kesalahan di Aplikasi", "Application Error Occurred");
content = content.replace("Aplikasi mengalami kendala saat dimuat.", "The application encountered an issue while loading.");
content = content.replace("Muat Ulang & Reset Cache", "Reload & Reset Cache");

fs.writeFileSync('src/components/ErrorBoundary.tsx', content);
