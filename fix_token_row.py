import re

with open('src/components/TokenRow.tsx', 'r') as f:
    content = f.read()

content = content.replace('      </motion.div>\n    </>\n  );\n};', '        </div>\n      </motion.div>\n    </>\n  );\n};')

with open('src/components/TokenRow.tsx', 'w') as f:
    f.write(content)
