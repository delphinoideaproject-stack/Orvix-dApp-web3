const fs = require('fs');
let content = fs.readFileSync('src/pages/SubmitWizard.tmp1.tsx', 'utf-8');

// 1. Remove the Premium Block inside isSubmitted
const premiumBlockStart = '{/* Premium Upgrade (Optional) */}';
const finalNavStart = '{/* Final Navigation Action */}';

const pIndex = content.indexOf(premiumBlockStart);
const fIndex = content.indexOf(finalNavStart);

if (pIndex !== -1 && fIndex !== -1) {
  content = content.substring(0, pIndex) + content.substring(fIndex);
}

// 2. We can see CONFIRM DEPOSIT MODAL code is still there, because we used a bad regex for confirmModalEnd probably, let's just remove it.
const confirmModalStart = '{/* CONFIRM DEPOSIT MODAL */}';
const confirmModalEnd = 'export function SubmitWizard'; // wait this is top

const mIndex = content.indexOf(confirmModalStart);
if (mIndex !== -1) {
  // It's at the end of the file
  content = content.substring(0, mIndex) + '    </div>\n  );\n}';
}

fs.writeFileSync('src/pages/SubmitWizard.tsx', content);
