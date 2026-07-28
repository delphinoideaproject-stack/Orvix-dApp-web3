const fs = require('fs');
let code = fs.readFileSync('src/components/TokenModal.tsx', 'utf8');

const endStr = `            </div>
          )}
          </div>
      </div>
    </div>
    </div>
  );
  );
}`;

const correctEndStr = `            </div>
          )}
        </div>
      </div>
    </div>
  );
}`;

code = code.replace(endStr, correctEndStr);
// Let's just do a robust replacement of the end of the file
code = code.replace(/          \)\}          <\/div>\n      <\/div>\n    <\/div>\n    <\/div>\n  \);\n  \);\n\}/, '          )}\n        </div>\n      </div>\n    </div>\n  );\n}');

fs.writeFileSync('src/components/TokenModal.tsx', code);
