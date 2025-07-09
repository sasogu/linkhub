// Script para reemplazar la versión en sw.js automáticamente
const fs = require('fs');
const path = require('path');
const pkg = require('./package.json');

const src = path.join(__dirname, 'public', 'sw.js.template');
const dest = path.join(__dirname, 'public', 'sw.js');

const template = fs.readFileSync(src, 'utf8');
const result = template.replace('__APP_VERSION__', pkg.version);
fs.writeFileSync(dest, result);
console.log(`sw.js generado con versión ${pkg.version}`);
