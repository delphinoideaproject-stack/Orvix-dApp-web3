import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Replace Setting button
old_setting = r'<button\s*onClick=\{\(\) => setSettingsOpen\(true\)\}\s*className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"\s*aria-label="App Settings"\s*>\s*<Settings className="w-4 h-4" />\s*</button>'
new_setting = r'''<button 
                onClick={() => setSettingsOpen(true)}
                className="bg-slate-800 text-slate-100 hover:bg-slate-900 border border-slate-700 shadow-sm dark:bg-slate-200/20 dark:border-slate-300/60 dark:text-slate-100 dark:hover:bg-slate-200/30 px-4 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2"
                aria-label="App Settings"
              >
                <Settings className="w-3.5 h-3.5" />
                SETTING
              </button>'''

content = re.sub(old_setting, new_setting, content)

# Replace Connect Wallet button
old_connect = r'className="bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-900 dark:text-white px-6 py-2 rounded-sm text-\[10px\] font-black uppercase tracking-widest transition-all cursor-pointer z-50"'
new_connect = r'className="bg-slate-800 text-slate-100 hover:bg-slate-900 border border-slate-700 shadow-sm dark:bg-slate-200/20 dark:border-slate-300/60 dark:text-slate-100 dark:hover:bg-slate-200/30 px-6 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer z-50"'

content = content.replace(old_connect, new_connect)
content = content.replace('"Connect Wallet"', '"CONNECT WALLET"')

with open('src/App.tsx', 'w') as f:
    f.write(content)
