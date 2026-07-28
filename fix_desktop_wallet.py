with open('src/App.tsx', 'r') as f:
    content = f.read()

import re
old_btn = r'<button onClick=\{\(\) => \{ console\.log\(\'Desktop wallet button clicked\'\); openWallet\(\); \}\} className="bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-900 dark:text-white px-6 py-2 rounded-sm text-\[10px\] font-black uppercase tracking-widest transition-all cursor-pointer z-50">'
new_btn = r'<button onClick={() => { console.log(\'Desktop wallet button clicked\'); openWallet(); }} className="bg-slate-800 text-slate-100 hover:bg-slate-900 border border-slate-700 shadow-sm dark:bg-slate-200/20 dark:border dark:border-slate-300/60 dark:text-slate-100 dark:hover:bg-slate-200/30 px-6 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer z-50">'

content = re.sub(old_btn, new_btn, content)

with open('src/App.tsx', 'w') as f:
    f.write(content)
