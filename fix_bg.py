import re

with open('src/components/TokenPosterCard.tsx', 'r') as f:
    content = f.read()

old_motion = r'''    <motion.div
      onClick={() => onSelect\?.\(token\)}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        ease: \[0.16, 1, 0.3, 1\],
        delay: Math.min\(index, 8\) \* 0.05 
      }}
      className={cn\(
        "p-4 flex flex-col group cursor-pointer transition-colors",
        "bg-white/60 dark:bg-\[#0f1419\]/40 backdrop-blur-md border border-zinc-200 dark:border-white/10 rounded-2xl hover:border-cyan-500/50 shadow-\[0_4px_24px_rgba\(0,0,0,0.02\)\] dark:shadow-none"
      \)}
    >
      <div className="flex items-start justify-between mb-8">
        <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-500/20 flex items-center justify-center border border-cyan-100 dark:border-cyan-500/30 overflow-hidden shrink-0">
          <TokenLogo tokenId={token.logo \|\| token.id} className="w-10 h-10" />
        </div>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full \${isPositive \? 'bg-green-500/10 text-green-500 dark:text-green-400' : 'bg-red-500/10 text-red-500 dark:text-red-400'}`}>
          {isPositive \? '\+' : ''}{formatGlobalNumber\(token.priceChange\)}%
        </span>
      </div>
            
      <div>
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1 truncate">{token.pair}</h3>
        <div className="text-sm text-zinc-500 dark:text-zinc-400 font-mono mb-4">\${formatGlobalNumber\(token.price\)}</div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-400 dark:text-zinc-500">Listed {token.listedAt}</span>
          <span className="text-cyan-500 dark:text-cyan-400 group-hover:translate-x-1 transition-transform font-medium">Trade &rarr;</span>
        </div>
      </div>
    </motion.div>'''

new_motion = '''    <motion.div
      onClick={() => onSelect?.(token)}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        ease: [0.16, 1, 0.3, 1],
        delay: Math.min(index, 8) * 0.05 
      }}
      className={cn(
        "p-4 flex flex-col group cursor-pointer transition-colors relative overflow-hidden",
        "bg-white/60 dark:bg-[#0f1419]/40 backdrop-blur-md border border-zinc-200 dark:border-white/10 rounded-2xl hover:border-cyan-500/50 shadow-[0_4px_24px_rgba(0,0,0,0.02)] dark:shadow-none"
      )}
    >
      {/* Background Image (Wallpaper) */}
      {token.wallpaper && (
        <div className="absolute inset-0 z-0 pointer-events-none opacity-25 dark:opacity-20 transition-opacity group-hover:opacity-30 dark:group-hover:opacity-30">
          <img src={token.wallpaper} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#0f1419] to-transparent" />
        </div>
      )}

      <div className="flex items-start justify-between mb-8 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-500/20 flex items-center justify-center border border-cyan-100 dark:border-cyan-500/30 overflow-hidden shrink-0 shadow-sm backdrop-blur-md">
          <TokenLogo tokenId={token.logo || token.id} className="w-10 h-10" />
        </div>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full relative z-10 backdrop-blur-sm ${isPositive ? 'bg-green-500/10 text-green-500 dark:text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-500 dark:text-red-400 border border-red-500/20'}`}>
          {isPositive ? '+' : ''}{formatGlobalNumber(token.priceChange)}%
        </span>
      </div>
            
      <div className="relative z-10">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1 truncate drop-shadow-sm">{token.pair}</h3>
        <div className="text-sm text-zinc-600 dark:text-zinc-300 font-mono mb-4 drop-shadow-sm">${formatGlobalNumber(token.price)}</div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-500 dark:text-zinc-400">Listed {token.listedAt}</span>
          <span className="text-cyan-500 dark:text-cyan-400 group-hover:translate-x-1 transition-transform font-medium">Trade &rarr;</span>
        </div>
      </div>
    </motion.div>'''

import re
content = re.sub(old_motion, new_motion, content)

with open('src/components/TokenPosterCard.tsx', 'w') as f:
    f.write(content)

