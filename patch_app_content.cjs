const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

if (!content.includes('import { DocsPage')) {
  content = content.replace(
    "import { StaticPage } from './pages/StaticPage';",
    "import { StaticPage } from './pages/StaticPage';\nimport { DocsPage, WhitepaperPage, ContactPage, PrivacyPage } from './pages/ContentPages';"
  );
}

// Replace DOCS
content = content.replace(
  /<StaticPage title="Documentation">[\s\S]*?<\/StaticPage>/,
  '<DocsPage />'
);

// Replace WHITEPAPER
content = content.replace(
  /<StaticPage title="Whitepaper">[\s\S]*?<\/StaticPage>/,
  '<WhitepaperPage />'
);

// Replace CONTACT
content = content.replace(
  /<StaticPage title="Contact Us">[\s\S]*?<\/StaticPage>/,
  '<ContactPage />'
);

// Replace PRIVACY
content = content.replace(
  /<StaticPage title="Privacy Policy">[\s\S]*?<\/StaticPage>/,
  '<PrivacyPage />'
);

fs.writeFileSync('src/App.tsx', content);
