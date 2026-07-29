const fs = require('fs');
let content = fs.readFileSync('src/pages/SubmitWizard.tsx', 'utf-8');

const premiumStart = '{/* PREMIUM ACCESS SECTION (0.25% TREASURY CONTRIBUTION) */}';
const premiumEnd = '{/* Final Navigation Action */}';

const startIdx = content.indexOf(premiumStart);
const endIdx = content.indexOf(premiumEnd);

if (startIdx !== -1 && endIdx !== -1) {
  content = content.substring(0, startIdx) + content.substring(endIdx);
  fs.writeFileSync('src/pages/SubmitWizard.tsx', content);
} else {
  console.log("NOT FOUND");
}
