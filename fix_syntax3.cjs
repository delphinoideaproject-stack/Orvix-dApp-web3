const fs = require('fs');
let code = fs.readFileSync('src/components/TokenModal.tsx', 'utf8');

const lastIndex = code.lastIndexOf(')}');
code = code.substring(0, lastIndex + 2) + `
        </div>
      </div>
    </div>
  );
}
`;
fs.writeFileSync('src/components/TokenModal.tsx', code);
