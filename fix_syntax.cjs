const fs = require('fs');
let code = fs.readFileSync('src/components/TokenModal.tsx', 'utf8');

// The end of the file should look like:
//           )}
//       </div>
//     </div>
//   );
// }

const endRegex = /          \)\}\n          <\/div>\n      <\/div>\n    <\/div>\n    <\/div>\n  \);\n  \);\n\}/s;
code = code.replace(/          \}\)\n          <\/div>\n      <\/div>\n    <\/div>[\s\S]*$/, '          )}\n      </div>\n    </div>\n  );\n}');

fs.writeFileSync('src/components/TokenModal.tsx', code);
