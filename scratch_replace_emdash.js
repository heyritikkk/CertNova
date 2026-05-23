const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  // First replace em-dashes that have spaces around them
  content = content.replace(/\s*—\s*/g, ' - ');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

// 1. Process the manual
const manualPath = path.join(__dirname, 'server', 'seeds', 'data', 'network-security-manual.md');
if (fs.existsSync(manualPath)) {
  processFile(manualPath);
}

// 2. Process all lessons
const lessonsDir = path.join(__dirname, 'server', 'seeds', 'lessons');
if (fs.existsSync(lessonsDir)) {
  const files = fs.readdirSync(lessonsDir);
  files.forEach(file => {
    if (file.endsWith('.md')) {
      processFile(path.join(lessonsDir, file));
    }
  });
}

// 3. Process networkSecurityContent.js
const contentJsPath = path.join(__dirname, 'server', 'seeds', 'networkSecurityContent.js');
if (fs.existsSync(contentJsPath)) {
  processFile(contentJsPath);
}

// 4. Process CourseDetail.css (in the comment)
const courseDetailCssPath = path.join(__dirname, 'client', 'src', 'pages', 'CourseDetail.css');
if (fs.existsSync(courseDetailCssPath)) {
  processFile(courseDetailCssPath);
}
