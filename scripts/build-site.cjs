const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'dist');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
// Publish runtime files only: no repository metadata, tests, or local settings.
for (const name of fs.readdirSync(root)) {
  if (name === 'index.html' || /\.(css|js)$/.test(name)) {
    fs.copyFileSync(path.join(root, name), path.join(out, name));
  }
}
fs.cpSync(path.join(root, 'assets'), path.join(out, 'assets'), { recursive: true });
const vendor = path.join(out, 'vendor');
fs.mkdirSync(vendor);
fs.copyFileSync(path.join(root, 'node_modules/opensheetmusicdisplay/build/opensheetmusicdisplay.min.js'), path.join(vendor, 'opensheetmusicdisplay.min.js'));
const html = fs.readFileSync(path.join(out, 'index.html'), 'utf8').replace('node_modules/opensheetmusicdisplay/build/opensheetmusicdisplay.min.js', 'vendor/opensheetmusicdisplay.min.js');
fs.writeFileSync(path.join(out, 'index.html'), html);
fs.writeFileSync(path.join(out, '.nojekyll'), '');
console.log('Built static site in dist/');
