with open('src/App.tsx', 'r') as f:
    content = f.read()

import re
old_setting = r'''<button 
                onClick=\{\(\) => setSettingsOpen\(true\)\}
                className="bg-slate-800 text-slate-100 hover:bg-slate-900 border border-slate-700 shadow-sm dark:bg-slate-200/20 dark:border-slate-300/60 dark:text-slate-100 dark:hover:bg-slate-200/30 p-2 rounded-sm transition-all cursor-pointer flex items-center justify-center"
                aria-label="App Settings"
              >
                <Settings className="w-4 h-4" />
              </button>'''

new_setting = r'''<button 
                onClick={() => setSettingsOpen(true)}
                className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
                aria-label="App Settings"
              >
                <Settings className="w-4 h-4" />
              </button>'''

content = re.sub(old_setting, new_setting, content)

with open('src/App.tsx', 'w') as f:
    f.write(content)

with open('src/components/Footer.tsx', 'r') as f:
    footer = f.read()

old_footer = r'''<div className="max-w-7xl mx-auto px-6 mt-16 pt-6 border-t border-zinc-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-zinc-500 dark:text-zinc-500">
        <span>Orvix Labs ©2026</span>
        
      </div>'''

new_footer = r'''<div className="max-w-7xl mx-auto px-6 mt-16 pt-6 border-t border-zinc-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-center md:items-start gap-4 text-xs font-medium text-zinc-500 dark:text-zinc-500">
        <span className="w-full text-left">Orvix Labs ©2026</span>
      </div>'''

footer = footer.replace(old_footer, new_footer)

with open('src/components/Footer.tsx', 'w') as f:
    f.write(footer)
