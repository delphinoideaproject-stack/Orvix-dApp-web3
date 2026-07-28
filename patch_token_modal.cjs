const fs = require('fs');
let code = fs.readFileSync('src/components/TokenModal.tsx', 'utf8');

// 1. Remove customAddress state
code = code.replace(/const \[customAddress, setCustomAddress\] = useState\(''\);\n/, '');

// 2. Remove setCustomAddress('') in useEffect
code = code.replace(/setCustomAddress\(''\);\n/g, '');

// 3. Update handleDetectToken to take an address parameter
code = code.replace(/const handleDetectToken = async \(\) => {/, 'const handleDetectToken = async (addressToDetect: string) => {');
code = code.replace(/const address = customAddress.trim\(\);/, 'const address = addressToDetect.trim();');

// 4. Update the Search Input placeholder
code = code.replace(/placeholder="Search name or symbol"/, 'placeholder="Search name, symbol, or paste contract address"');

// 5. Remove the entire "Paste Contract Address Block"
const pasteBlockRegex = /\{\/\* Paste Contract Address Block \*\/\}.*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/s;
code = code.replace(pasteBlockRegex, '</div>\n      </div>\n    </div>');

// 6. Add dynamic detection button when a valid address is pasted but not found
const searchResultsBlock = /\{\/\* Search Results \*\/\}/; // Wait, there is no "Search Results" comment.
// Let's replace the debouncedQuery.length > 0 block.
const resultsRegex = /\{debouncedQuery\.length > 0 && \([\s\S]*?No tokens found<\/div>\n              \)}\n            <\/div>\n          \)}/;

const newResultsBlock = `{debouncedQuery.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-zinc-500 tracking-wider mb-2 uppercase">Search Results</div>
              {loading || loadingDynamic ? (
                <div className="flex flex-col items-center justify-center py-8 text-zinc-400">
                  <Loader2 className="w-5 h-5 animate-spin text-[#5cceff] mb-1" />
                  <span className="text-[11px]">{loadingDynamic ? 'Detecting Token...' : 'Searching...'}</span>
                </div>
              ) : filteredTokens.length > 0 ? (
                <div className="space-y-1">
                  {filteredTokens.map(token => (
                    <button
                      key={token.id}
                      onClick={() => onSelect(token)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#1e3a5f]/30 transition-colors cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#07101e] flex items-center justify-center overflow-hidden shrink-0 border border-[#1e3a5f]/20">
                           {token.logo ? (
                             <img 
                               src={token.logo} 
                               alt={token.symbol} 
                               className="w-full h-full object-cover" 
                               onError={(e) => {
                                 (e.target as HTMLElement).style.display = 'none';
                               }}
                             />
                           ) : (
                             <span className="text-xs font-bold text-zinc-400">{token.symbol[0]}</span>
                           )}
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-sm text-white">{token.symbol}</span>
                            {verifiedTokensList.some(vt => vt.symbol.toLowerCase() === token.symbol.toLowerCase()) && (
                              <span className="w-3.5 h-3.5 bg-[#5cceff]/10 rounded-full flex items-center justify-center">
                                <Check className="w-2.5 h-2.5 text-[#5cceff]" />
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-zinc-400 font-medium truncate max-w-[200px]">{token.name}</span>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end shrink-0">
                        <span className="text-xs font-mono text-[#5cceff] font-bold">{token.symbol}</span>
                        <span className="text-[9px] text-zinc-500 font-mono">{token.contract.substring(0, 6)}...{token.contract.substring(38)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : /^0x[a-fA-F0-9]{40}$/i.test(debouncedQuery.trim()) ? (
                <div className="text-center py-6 flex flex-col items-center justify-center gap-3">
                  <div className="text-zinc-400 text-xs mb-1">Contract address detected</div>
                  <button
                    type="button"
                    onClick={() => handleDetectToken(debouncedQuery)}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#1e3a5f] to-[#5cceff]/80 hover:from-[#1e3a5f] hover:to-[#5cceff] text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    Import Token
                  </button>
                </div>
              ) : (
                <div className="text-center py-6 text-zinc-500 text-xs">No tokens found</div>
              )}
            </div>
          )}`;

code = code.replace(resultsRegex, newResultsBlock);

fs.writeFileSync('src/components/TokenModal.tsx', code);
