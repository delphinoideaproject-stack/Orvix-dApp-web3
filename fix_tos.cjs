const fs = require('fs');
let content = fs.readFileSync('src/pages/SubmitWizard.tsx', 'utf-8');

content = content.replace(
  /<strong>2\. Treasury Deposit \(0\.25\%\):<\/strong> For projects without an existing active liquidity pair, a standard 0\.25\% total supply deposit to the Orvix Treasury is required for automated review processing\./,
  "<strong>2. Premium Access Deposit (0.25%):</strong> A standard 0.25% total supply deposit to the Orvix Treasury is required for all project submissions. This unlocks Premium Features immediately."
);

fs.writeFileSync('src/pages/SubmitWizard.tsx', content);
