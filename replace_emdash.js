const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      replaceInDir(fullPath);
    } else if (stat.isFile() && /\.(jsx?|css|md)$/.test(file)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('—')) {
        // Replace '—' (em-dash) with ' - ' if there's no space around it, else just '-'
        content = content.replace(/([^\s])—([^\s])/g, '$1 - $2');
        content = content.replace(/—/g, '-');
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Replaced in ${fullPath}`);
      }
    }
  }
}

replaceInDir(path.join(__dirname, 'client', 'src'));
replaceInDir(path.join(__dirname, 'server', 'seeds'));
console.log('Done replacing em-dashes.');
