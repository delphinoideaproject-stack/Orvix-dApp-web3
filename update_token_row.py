import re

with open('src/components/TokenRow.tsx', 'r') as f:
    content = f.read()

# 1. Add overflow-hidden to the motion.div
old_class = r'className="border border-\[var\(--border\)\] rounded-3xl bg-\[var\(--card\)\] p-4 sm:p-6 mb-6 flex flex-col hover:border-cyan-500/60 dark:hover:border-cyan-500/60 transition-all duration-300 cursor-pointer group relative shadow-sm"'
new_class = 'className="border border-[var(--border)] rounded-3xl bg-[var(--card)] p-0 mb-6 flex flex-col hover:border-cyan-500/60 dark:hover:border-cyan-500/60 transition-all duration-300 cursor-pointer group relative shadow-sm overflow-hidden"'

content = content.replace(old_class, new_class)

# 2. Add wallpaper block and wrap the rest in a padded div
# We find where Watchlist Star is
old_watchlist = r'''        {/\* Watchlist Star \*/}
        <button
          onClick=\{\(e\) => \{'''

new_wallpaper_and_wrap = '''        {/* Header Image (Wallpaper) */}
        {token.wallpaper && (
          <div className="w-full h-24 sm:h-32 relative shrink-0">
            <img src={token.wallpaper} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--card)] to-transparent" />
          </div>
        )}
        
        <div className="p-4 sm:p-6 flex flex-col flex-1 relative">
        {/* Watchlist Star */}
        <button
          onClick={(e) => {'''

content = re.sub(old_watchlist, new_wallpaper_and_wrap, content)

# 3. We need to close the padded div right before the end of the motion.div
# The end of motion.div is around here:
#       </motion.div>
#     </>
#   );
# };

old_end = r'''      </motion.div>
    </>
  \);
\};'''

new_end = '''        </div>
      </motion.div>
    </>
  );
};'''

content = re.sub(old_end, new_end, content)

with open('src/components/TokenRow.tsx', 'w') as f:
    f.write(content)
