with open('src/components/Footer.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '<footer className="border-t border-zinc-200 dark:border-white/5 py-12 w-full">',
    '<footer className="border-t border-zinc-200 dark:border-white/5 pt-12 pb-24 md:pb-12 w-full">'
)

with open('src/components/Footer.tsx', 'w') as f:
    f.write(content)
