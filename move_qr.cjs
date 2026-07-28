const fs = require('fs');
let content = fs.readFileSync('src/components/ShareBottomSheet.tsx', 'utf-8');

// Update Canvas Drawing Logic
content = content.replace(
  "// 5. QR Code Bottom Left\n      const qrSize = 130;\n      const qrX = 60;",
  "// 5. QR Code Bottom Right\n      const qrSize = 130;\n      const qrX = canvas.width - 60 - qrSize;"
);

// Update React DOM Logic
const domToReplace = `{/* Lower Row: PRICE, Percentage, Mini chart */}
            <div className="relative z-10 mt-4">
              <div className="text-[10px] sm:text-xs uppercase font-bold text-zinc-400 tracking-widest mb-1">PRICE</div>
              <div className="flex items-end gap-4">
                <div className="text-3xl sm:text-5xl font-black font-mono text-white leading-none">
                  \${formatGlobalNumber(token.price)}
                </div>
                <div className={\`text-xl sm:text-3xl font-black leading-none mb-1 \${isPositive ? 'text-emerald-400' : 'text-rose-400'}\`}>
                  {isPositive ? '+' : ''}{formatGlobalNumber(token.priceChange)}%
                </div>
                {/* Mini chart line */}
                <div className="ml-2 w-20 h-6 sm:w-28 sm:h-10 mb-1 flex items-center">
                  <svg width="100%" height="100%" viewBox="0 0 100 30" preserveAspectRatio="none">
                    <path 
                      d={isPositive ? "M0,25 C20,20 40,30 60,10 S80,15 100,5" : "M0,5 C20,10 40,0 60,20 S80,15 100,25"}
                      fill="none" 
                      stroke={isPositive ? "#34d399" : "#fb7185"} 
                      strokeWidth="4" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      style={{ filter: \`drop-shadow(0px 4px 6px \${isPositive ? 'rgba(52,211,153,0.3)' : 'rgba(251,113,133,0.3)'})\` }}
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Footer QR without box container */}
            <div className="relative z-10 mt-auto pt-4 flex items-center">
              <QRCodeSVG
                value={\`https://orvix.io/token/\${token.contract}\`}
                size={70}
                level="M"
                includeMargin={false}
                bgColor="transparent"
                fgColor="#ffffff"
              />
            </div>`;

const newDom = `{/* Lower Row: PRICE, Percentage, Mini chart & QR Code */}
            <div className="relative z-10 mt-auto pt-4 flex items-end justify-between">
              <div>
                <div className="text-[10px] sm:text-xs uppercase font-bold text-zinc-400 tracking-widest mb-1">PRICE</div>
                <div className="flex items-end gap-4">
                  <div className="text-3xl sm:text-5xl font-black font-mono text-white leading-none">
                    \${formatGlobalNumber(token.price)}
                  </div>
                  <div className={\`text-xl sm:text-3xl font-black leading-none mb-1 \${isPositive ? 'text-emerald-400' : 'text-rose-400'}\`}>
                    {isPositive ? '+' : ''}{formatGlobalNumber(token.priceChange)}%
                  </div>
                  {/* Mini chart line */}
                  <div className="ml-2 w-20 h-6 sm:w-28 sm:h-10 mb-1 flex items-center">
                    <svg width="100%" height="100%" viewBox="0 0 100 30" preserveAspectRatio="none">
                      <path 
                        d={isPositive ? "M0,25 C20,20 40,30 60,10 S80,15 100,5" : "M0,5 C20,10 40,0 60,20 S80,15 100,25"}
                        fill="none" 
                        stroke={isPositive ? "#34d399" : "#fb7185"} 
                        strokeWidth="4" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        style={{ filter: \`drop-shadow(0px 4px 6px \${isPositive ? 'rgba(52,211,153,0.3)' : 'rgba(251,113,133,0.3)'})\` }}
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Footer QR without box container */}
              <div className="flex items-center">
                <QRCodeSVG
                  value={\`https://orvix.io/token/\${token.contract}\`}
                  size={70}
                  level="M"
                  includeMargin={false}
                  bgColor="transparent"
                  fgColor="#ffffff"
                />
              </div>
            </div>`;

content = content.replace(domToReplace, newDom);
fs.writeFileSync('src/components/ShareBottomSheet.tsx', content);
console.log('patched');
