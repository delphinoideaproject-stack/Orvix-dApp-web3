with open('src/pages/TokenDetailPage.tsx', 'r') as f:
    content = f.read()

old_class = 'className={`w-full py-3 rounded-xl font-bold uppercase tracking-wider text-sm transition-all duration-300 ${'
new_class = 'className={`w-full py-3 rounded-sm font-black uppercase tracking-widest text-[10px] transition-all duration-300 ${'

content = content.replace(old_class, new_class)

with open('src/pages/TokenDetailPage.tsx', 'w') as f:
    f.write(content)
