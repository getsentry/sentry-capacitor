const fs = require('fs');
const path = require('path');

//Filters all Sentry packages but Capacitor itself.
const jsonFilter = /\s*\"\@sentry\/(?!capacitor)(?<packageName>[a-zA-Z]+)\"\:\s*\"(?<version>.+)\"/;
const siblingVersion = "7.15.0";

/* TODO: Not valid for all the cases
// const getDirectories = source =>
//   fs.readdirSync(source, { withFileTypes: true })
//     .filter(dirent => dirent.isDirectory())
//     .map(dirent => dirent.name)
//
// Checks the node_modules folder @sentry/capacitor.
// const capDirectories = getDirectories("node_modules");
// if(!capDirectories.includes("@sentry")) {
// There is not conflict with Sentry dependencies so we can skip the post install.
//       return;
// }
*/

// get the location of package.json from the project.
let rootPath = __dirname + '/../../';
while (!fs.existsSync(path.resolve(rootPath, 'package.json'))) {
  rootPath += '../';
}

const packageJson = fs.readFileSync(rootPath + 'package.json', 'utf8').split("\n");
for (const lineData of packageJson)
{
      let sentryRef = lineData.match(jsonFilter);
      if (sentryRef && sentryRef[2] !== siblingVersion) {
            const depName = "@Sentry/" + sentryRef[1];
            throw "This version of Sentry Capacitor is incompatible with " + depName + " version " + sentryRef[2] + ".\n Please update " + depName + " to version " + siblingVersion + ".";
      }
}
