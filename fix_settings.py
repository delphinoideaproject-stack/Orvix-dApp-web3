with open('src/App.tsx', 'r') as f:
    content = f.read()

import re

old_btn = r'''<button 
                onClick=\{\(\) => setSettingsOpen\(true\)\}
                className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
                aria-label="App Settings"
              >
                <Settings className="w-4 h-4" />
              </button>'''

new_btn = r'''<button 
                onClick={() => setSettingsOpen(true)}
                className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer p-2 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-white/5"
                aria-label="App Settings"
              >
                <Settings className="w-5 h-5" />
              </button>'''

content = re.sub(old_btn, new_btn, content)

with open('src/App.tsx', 'w') as f:
    f.write(content)
