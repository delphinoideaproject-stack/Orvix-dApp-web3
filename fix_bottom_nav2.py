with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace('className={cn(\n              "p-3 rounded-full bg-white dark:bg-zinc-900 shadow-lg border border-zinc-200 dark:border-white/10 transition-all cursor-pointer relative hover:scale-110",\n              currentPage === \'HOME\' ? "text-slate-900 dark:text-slate-100" : "text-zinc-500 dark:text-zinc-400"\n            )}', 'className={cn(\n              "p-2 transition-all cursor-pointer relative hover:scale-110",\n              currentPage === \'HOME\' ? "text-slate-900 dark:text-slate-100" : "text-zinc-500 dark:text-zinc-400"\n            )}')

content = content.replace('className={cn(\n              "p-3 rounded-full bg-white dark:bg-zinc-900 shadow-lg border border-zinc-200 dark:border-white/10 transition-all cursor-pointer relative hover:scale-110",\n              currentPage === \'SWAP\' ? "text-slate-900 dark:text-slate-100" : "text-zinc-500 dark:text-zinc-400"\n            )}', 'className={cn(\n              "p-2 transition-all cursor-pointer relative hover:scale-110",\n              currentPage === \'SWAP\' ? "text-slate-900 dark:text-slate-100" : "text-zinc-500 dark:text-zinc-400"\n            )}')

content = content.replace('className={cn(\n              "p-3 rounded-full bg-white dark:bg-zinc-900 shadow-lg border border-zinc-200 dark:border-white/10 transition-all cursor-pointer relative hover:scale-110",\n              currentPage === \'HISTORY\' ? "text-slate-900 dark:text-slate-100" : "text-zinc-500 dark:text-zinc-400"\n            )}', 'className={cn(\n              "p-2 transition-all cursor-pointer relative hover:scale-110",\n              currentPage === \'HISTORY\' ? "text-slate-900 dark:text-slate-100" : "text-zinc-500 dark:text-zinc-400"\n            )}')

# Wait, SVG has mb-0.5. Let's remove it
content = content.replace('className="w-5 h-5 mb-0.5 transition-all"', 'className="w-6 h-6 transition-all drop-shadow-md"')


with open('src/App.tsx', 'w') as f:
    f.write(content)
