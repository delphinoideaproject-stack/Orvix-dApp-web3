import re

with open('src/components/TokenRow.tsx', 'r') as f:
    content = f.read()

# The wrapper around TokenLogo:
old_logo_wrapper = r'''        <div className="relative mb-4 sm:mb-6">
          <div 
            className={`inline-block mb-3 sm:mb-4 rounded-full p-\[3px\] transition-transform \$\{hasActiveStories \? 'bg-zinc-200 dark:bg-white/10 hover:scale-105 cursor-pointer' : ''\}`}'''

new_logo_wrapper = '''        <div className="relative mb-4 sm:mb-6">
          <div 
            className={`inline-block mb-3 sm:mb-4 rounded-full p-[3px] transition-transform ${token.wallpaper ? '-mt-10 sm:-mt-12 z-10 relative' : ''} ${hasActiveStories ? 'bg-zinc-200 dark:bg-white/10 hover:scale-105 cursor-pointer' : ''}`}'''

content = re.sub(old_logo_wrapper, new_logo_wrapper, content)

with open('src/components/TokenRow.tsx', 'w') as f:
    f.write(content)
