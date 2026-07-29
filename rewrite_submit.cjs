const fs = require('fs');
let content = fs.readFileSync('src/pages/SubmitWizard.tsx', 'utf-8');

// 1. Remove hasLiquidityPair from formData
content = content.replace(/\s*hasLiquidityPair:\s*'no',\s*\/\/\s*'no'\s*\|\s*'yes'/, '');

// 2. Change 0.07% calculation to 0.25% in tokenInfo
content = content.replace(/const depositAmount = humanSupply \* 0\.07 \/ 100;/, 'const depositAmount = humanSupply * 0.25 / 100;');

// 3. Update Validation for Step 4 (isAccessible)
content = content.replace(
  /s\.num === 4\s*\?\s*\(isWalletConnected && termsAccepted && step3Valid\)\s*:\s*\(isWalletConnected && termsAccepted && step3Valid && \(isDepositConfirmed \|\| formData\.hasLiquidityPair === 'yes'\)\)/,
  "s.num === 4 ? (isWalletConnected && termsAccepted && step3Valid) : (isWalletConnected && termsAccepted && step3Valid && hasPremiumAccess)"
);

// 4. Update Step 3 (remove Active Liquidity Toggle)
const activeLiqStart = '{/* Active Liquidity Toggle */}';
const activeLiqEnd = '{/* Visual Links & Media */}';
const activeLiqIndex = content.indexOf(activeLiqStart);
const activeLiqEndIndex = content.indexOf(activeLiqEnd);
if (activeLiqIndex !== -1 && activeLiqEndIndex !== -1) {
  content = content.substring(0, activeLiqIndex) + content.substring(activeLiqEndIndex);
}

// 5. Update Step 4 (Treasury Deposit -> Premium Access)
const step4Start = '{/* STEP 4: TREASURY DEPOSIT */}';
const step4End = '{/* STEP 5: SUBMIT & REVIEW STATUS */}';
const step4Index = content.indexOf(step4Start);
const step4EndIndex = content.indexOf(step4End);

if (step4Index !== -1 && step4EndIndex !== -1) {
  const step4Dom = `{/* STEP 4: PREMIUM ACCESS DEPOSIT */}
        {step === 4 && (
          <div className="space-y-6 max-w-2xl mx-auto py-2">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">Step 4 of 5</div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                Premium Access Verification
                <Crown className="w-5 h-5 text-amber-500" />
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                A 0.25% total supply deposit is required for submission. This grants immediate Premium Access, unlocking Story and Banner features.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-5 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-950 space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500 font-mono uppercase tracking-wider">Required Amount (0.25% Total Supply)</span>
                  <span className="font-mono text-zinc-400">Official Treasury Address</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <div>
                    <div className="text-2xl font-extrabold font-mono text-cyan-600 dark:text-cyan-400">
                      {tokenInfo?.depositFormatted || ((Number(formData.totalSupply) || 1000000) * 0.0025).toLocaleString()}
                      <span className="text-sm font-semibold text-zinc-500 ml-1.5">{formData.symbol || 'TOKEN'}</span>
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">Calculated based on {Number(formData.totalSupply || 0).toLocaleString()} total supply</div>
                  </div>

                  <div className="text-xs font-mono bg-zinc-100 dark:bg-zinc-950 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 break-all sm:max-w-[220px]">
                    {ORVIX_CONFIG.treasury}
                  </div>
                </div>

                {hasPremiumAccess ? (
                  <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-semibold text-sm">
                      <Check className="w-5 h-5" />
                      Premium Access Granted
                    </div>
                    <a 
                      href={\`\${getExplorerUrl()}/tx/\${premiumTxHash}\`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-xs font-mono text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      {premiumTxHash.slice(0, 6)}...{premiumTxHash.slice(-4)} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ) : (
                  <Button 
                    size="lg"
                    className="w-full font-bold flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-zinc-950"
                    onClick={handleUpgradePremium}
                    disabled={isUpgradingPremium}
                  >
                    <Crown className="w-5 h-5" />
                    {isUpgradingPremium ? 'Confirming...' : 'Deposit 0.25% & Unlock Premium'}
                  </Button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <Button variant="ghost" onClick={() => setStep(3)} className="flex items-center gap-1">
                <ChevronLeft className="w-4 h-4" /> Back
              </Button>

              <Button 
                disabled={!hasPremiumAccess}
                onClick={() => setStep(5)}
                className="flex items-center gap-1 font-semibold px-6"
              >
                Proceed to Submit <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        `;
  content = content.substring(0, step4Index) + step4Dom + content.substring(step4EndIndex);
}

// 6. Update handleDepositConfirm to be merged with handleUpgradePremium or simply replace handleDepositConfirm entirely
// We can just remove handleDepositConfirm and isDepositConfirmed since we use hasPremiumAccess
content = content.replace(/const \[isDepositing, setIsDepositing\] = useState\(false\);\n  const \[isDepositConfirmed, setIsDepositConfirmed\] = useState\(false\);\n  const \[depositTxHash, setDepositTxHash\] = useState\(''\);\n  const \[showConfirmModal, setShowConfirmModal\] = useState\(false\);/, '');

// Find handleDepositConfirm and remove it
const handleDepositConfirmRegex = /const handleDepositConfirm = async \(\) => \{[\s\S]*?\};\n\n  \/\/ Step 5/;
content = content.replace(handleDepositConfirmRegex, '// Step 5');


// 7. Remove the confirmation modal for 0.07% deposit in the render
const confirmModalStart = '{/* Deposit Confirmation Modal */}';
const confirmModalEnd = 'export default SubmitWizard;';
const confirmModalIndex = content.indexOf(confirmModalStart);
const confirmModalEndIndex = content.indexOf(confirmModalEnd);
if (confirmModalIndex !== -1 && confirmModalEndIndex !== -1) {
  content = content.substring(0, confirmModalIndex) + content.substring(confirmModalEndIndex);
}

// 8. Update Step 5 UI to reflect Premium Access instead of 0.07%
content = content.replace(
  /\{formData\.hasLiquidityPair === 'yes' \? 'Waived \(Pair Active\)' : '0\.07% Verified'\}/g,
  "'Premium Access Verified'"
);
content = content.replace(/<span className="text-zinc-400 block font-mono uppercase text-\[10px\]">Treasury Status<\/span>/g, '<span className="text-zinc-400 block font-mono uppercase text-[10px]">Access Level</span>');

// 9. Remove Premium Feature block in Step 5 (since it's already granted)
const premiumBlockStart = '{/* Premium Upgrade (Optional) */}';
const premiumBlockEnd = '{/* Submission Success Modal */}'; // Wait, let's see what is after the premium feature block. It is actually inside the "isSubmitted" area.

fs.writeFileSync('src/pages/SubmitWizard.tmp1.tsx', content);
