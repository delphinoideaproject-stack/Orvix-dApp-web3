with open('src/App.tsx', 'r') as f:
    content = f.read()

import re
old = r'''<button 
                onClick=\{\(\) => setSettingsOpen\(true\)\}
                className="bg-slate-800 text-slate-100 hover:bg-slate-900 border border-slate-700 shadow-sm dark:bg-slate-200/20 dark:border-slate-300/60 dark:text-slate-100 dark:hover:bg-slate-200/30 px-4 py-2 rounded-sm text-\[10px\] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2"
                aria-label="App Settings"
              >
                <Settings className="w-3\.5 h-3\.5" />
                SETTING
              </button>'''

new = r'''<button 
                onClick={() => setSettingsOpen(true)}
                className="bg-slate-800 text-slate-100 hover:bg-slate-900 border border-slate-700 shadow-sm dark:bg-slate-200/20 dark:border-slate-300/60 dark:text-slate-100 dark:hover:bg-slate-200/30 p-2 rounded-sm transition-all cursor-pointer flex items-center justify-center"
                aria-label="App Settings"
              >
                <Settings className="w-4 h-4" />
              </button>'''

content = re.sub(old, new, content)

with open('src/App.tsx', 'w') as f:
    f.write(content)
