const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  let changed = false;
  
  const processedLines = lines.map(line => {
    // Check if line matches a bullet point with initial bold
    // e.g. * **Label:** or - **Label:**
    const match = line.match(/^(\s*[\*\-]\s+\*\*)(.*?)(?:\*\*)(.*)$/);
    if (match) {
      const prefix = match[1];
      const label = match[2];
      const explanation = match[3];
      
      if (explanation.includes('**')) {
        const cleanedExplanation = explanation.replace(/\*\*/g, '');
        changed = true;
        return `${prefix}${label}**${cleanedExplanation}`;
      }
    }
    return line;
  });
  
  if (changed) {
    fs.writeFileSync(filePath, processedLines.join('\n'), 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

// Process the manual
const manualPath = path.join(__dirname, 'server', 'seeds', 'data', 'network-security-manual.md');
if (fs.existsSync(manualPath)) {
  processFile(manualPath);
}

// Process all lessons
const lessonsDir = path.join(__dirname, 'server', 'seeds', 'lessons');
if (fs.existsSync(lessonsDir)) {
  const files = fs.readdirSync(lessonsDir);
  files.forEach(file => {
    if (file.endsWith('.md')) {
      processFile(path.join(lessonsDir, file));
    }
  });
}
