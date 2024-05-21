const os = require('os');
// This code will only execute if POD to install, so we ensure to only block the script on MacOS since other
// platfrorms doesn't have pod.s
if (os.platform() === 'darwin') {
  process.exit(1)
}
