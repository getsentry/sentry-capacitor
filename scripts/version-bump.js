const fs = require('fs');
const path = require('path');

const pjson = require('../package.json');

const versionFile = path.join(__dirname, '../src/version.ts');

try {
  let content = fs.readFileSync(versionFile, 'utf8');
  const versionRegex = /\d+\.\d+.\d+(?:-\w+(?:\.\w+)?)?/g;
  const newContent = content.replace(versionRegex, pjson.version);

  if (content !== newContent) {
    fs.writeFileSync(versionFile, newContent, 'utf8');
    console.log('Modified files: src/version.ts');
  } else {
    console.log('No changes needed in src/version.ts');
  }
} catch (error) {
  console.error('Error occurred:', error);
  process.exit(1);
}
