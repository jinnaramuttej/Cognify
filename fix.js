const fs = require('fs'); let code = fs.readFileSync('src/app/tests/create/page.tsx', 'utf8'); code = code.replace(/\\\/g, '\'); fs.writeFileSync('src/app/tests/create/page.tsx', code);
