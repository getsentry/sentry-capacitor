const os = require('os');

if (os.platform() !== 'darwin') { // macOS
  process.exit(0); // Lets ignore it.
}
