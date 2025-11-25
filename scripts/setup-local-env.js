#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get the project root from command line argument or use current working directory
const projectRoot = process.argv[2] || process.cwd();

// Try to detect the project type and set paths accordingly
// First, check if it's a Vue project (has src/config directory)
const vueExamplePath = path.join(projectRoot, 'src/config/local.example.ts');
const vueLocalPath = path.join(projectRoot, 'src/config/local.ts');

// Then check if it's an Angular project (has src/environments directory)
const angularExamplePath = path.join(projectRoot, 'src/environments/environment.local.example.ts');
const angularLocalPath = path.join(projectRoot, 'src/environments/environment.local.ts');

let examplePath, localPath, fileDescription;

if (fs.existsSync(vueExamplePath)) {
  // Vue project
  examplePath = vueExamplePath;
  localPath = vueLocalPath;
  fileDescription = 'src/config/local.ts';
} else if (fs.existsSync(angularExamplePath)) {
  // Angular project
  examplePath = angularExamplePath;
  localPath = angularLocalPath;
  fileDescription = 'src/environments/environment.local.ts';
} else {
  console.error('❌ Could not find local.example.ts file. Expected one of:');
  console.error(`   - ${vueExamplePath}`);
  console.error(`   - ${angularExamplePath}`);
  process.exit(1);
}

if (!fs.existsSync(localPath) && fs.existsSync(examplePath)) {
  fs.copyFileSync(examplePath, localPath);
  console.log(`✓ Created ${fileDescription} from example file`);
} else if (fs.existsSync(localPath)) {
  console.log(`✓ ${fileDescription} already exists`);
} else {
  console.warn(`⚠ Example file not found at ${examplePath}`);
}

