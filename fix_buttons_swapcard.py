with open('src/swap-components/components/SwapCard.tsx', 'r') as f:
    content = f.read()

old_primary = "primary: 'bg-accent-cyan text-bg-primary hover:brightness-110',"
new_primary = "primary: 'bg-slate-800 text-slate-100 hover:bg-slate-900 border border-slate-700 shadow-sm dark:bg-slate-200/20 dark:border-slate-300/60 dark:text-slate-100 dark:hover:bg-slate-200/30 uppercase tracking-widest text-[10px] font-black',"

content = content.replace(old_primary, new_primary)
content = content.replace("'Swap'", "'SWAP'")
content = content.replace("'Swapping...'", "'SWAPPING...'")

with open('src/swap-components/components/SwapCard.tsx', 'w') as f:
    f.write(content)
