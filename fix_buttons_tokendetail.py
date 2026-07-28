with open('src/pages/TokenDetailPage.tsx', 'r') as f:
    content = f.read()

old_trade = 'isTradeOpen ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400" : "bg-cyan-600 hover:bg-cyan-500 text-white"'
new_trade = 'isTradeOpen ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400" : "bg-slate-800 text-slate-100 hover:bg-slate-900 border border-slate-700 shadow-sm dark:bg-slate-200/20 dark:border-slate-300/60 dark:text-slate-100 dark:hover:bg-slate-200/30"'

content = content.replace(old_trade, new_trade)
content = content.replace("'TRADE'", "'TRADE NOW'")

with open('src/pages/TokenDetailPage.tsx', 'w') as f:
    f.write(content)
