with open('src/App.tsx', 'r') as f:
    content = f.read()

import re

# Remove labels
content = re.sub(r'<span className="text-\[10px\] tracking-wide font-medium transition-colors">Home</span>', '', content)
content = re.sub(r'<span className="text-\[10px\] tracking-wide font-medium transition-colors">Trade</span>', '', content)
content = re.sub(r'<span className="text-\[10px\] tracking-wide font-medium transition-colors">History</span>', '', content)

# Change container class
old_container = r'<div className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 dark:bg-black/95 backdrop-blur-md border-t border-zinc-200 dark:border-white/5 z-40 px-6 py-2 pb-safe shadow-\[0_-4px_24px_rgba\(0,0,0,0\.05\)\]">'
new_container = r'<div className="md:hidden fixed bottom-6 inset-x-0 z-40 px-6 pb-safe flex justify-center pointer-events-none">\n        <div className="flex gap-6 pointer-events-auto">'

content = re.sub(old_container, new_container, content)

# Remove the inner max-w-md div
old_inner = r'<div className="max-w-md mx-auto flex justify-between items-center">'
content = content.replace(old_inner, '')

# Adjust buttons slightly if we changed the container
content = content.replace('className={cn(\n              "flex-1 flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer relative hover:scale-105",\n              currentPage === \'HOME\' ? "font-semibold text-slate-900 dark:text-slate-100" : "text-zinc-500 dark:text-white/40"\n            )}', 'className={cn(\n              "p-3 rounded-full bg-white dark:bg-zinc-900 shadow-lg border border-zinc-200 dark:border-white/10 transition-all cursor-pointer relative hover:scale-110",\n              currentPage === \'HOME\' ? "text-slate-900 dark:text-slate-100" : "text-zinc-500 dark:text-zinc-400"\n            )}')

content = content.replace('className={cn(\n              "flex-1 flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer relative hover:scale-105",\n              currentPage === \'SWAP\' ? "font-semibold text-slate-900 dark:text-slate-100" : "text-zinc-500 dark:text-white/40"\n            )}', 'className={cn(\n              "p-3 rounded-full bg-white dark:bg-zinc-900 shadow-lg border border-zinc-200 dark:border-white/10 transition-all cursor-pointer relative hover:scale-110",\n              currentPage === \'SWAP\' ? "text-slate-900 dark:text-slate-100" : "text-zinc-500 dark:text-zinc-400"\n            )}')

content = content.replace('className={cn(\n              "flex-1 flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer relative hover:scale-105",\n              currentPage === \'HISTORY\' ? "font-semibold text-slate-900 dark:text-slate-100" : "text-zinc-500 dark:text-white/40"\n            )}', 'className={cn(\n              "p-3 rounded-full bg-white dark:bg-zinc-900 shadow-lg border border-zinc-200 dark:border-white/10 transition-all cursor-pointer relative hover:scale-110",\n              currentPage === \'HISTORY\' ? "text-slate-900 dark:text-slate-100" : "text-zinc-500 dark:text-zinc-400"\n            )}')

# Close the new inner div
content = content.replace('          </button>\n\n        </div>\n      </div>\n\n      <SettingsModal', '          </button>\n\n        </div>\n      </div>\n\n      <SettingsModal')


with open('src/App.tsx', 'w') as f:
    f.write(content)
