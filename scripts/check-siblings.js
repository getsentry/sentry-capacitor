const fs = require('fs');
const path = require('path');
const { env } = require('process');

const updateArgument = '--update-sentry-capacitor';

// Filters all Sentry packages but Capacitor, CLI and Wizard.
const jsonFilter = /\s*\"\@sentry\/(?!capacitor|wizard|cli|typescript|electron)(?<packageName>[a-zA-Z]+)\"\:\s*\"(?<version>.+)\"/;

/**
 * If user requested to ignore the post-install
 * @return {Boolean} true if requested to skip the post-install check, false otherwise.
 */
function SkipPostInstall() {
  if (env.npm_config_update_sentry_capacitor) {
    // NPM.
    return true;
  }
  else if (env.npm_config_argv && env.npm_config_argv.includes(updateArgument)) {
    // YARN.
    return true;
  }
  return false;
}

/**
 * Gets the required sibling version for Sentry Capacitor.
 * @return {String | undefined} The sibling version, undefined if not found.
 */
function GetRequiredSiblingVersion() {
  if (env.npm_package_dependencies__sentry_browser) {
    // Yarn.
    return env.npm_package_dependencies__sentry_browser;
  }

  let capacitorPackagePath = '';
  if (env.npm_package_json) {
    // NPM.
    capacitorPackagePath = env.npm_package_json;
  }
  else if (__dirname) {
    capacitorPackagePath = path.join(__dirname, '..', 'package.json');
  }
  else {
    return undefined;
  }

  const capacitorPackageJson = fs.readFileSync(capacitorPackagePath, 'utf8');

  const version = capacitorPackageJson.match(jsonFilter);
  if (version && version.groups['version']) {
    return version.groups['version'];
  }
  return undefined;
}

/**
 * Validate the arguments used to install Sentry Capacitor and it's siblings.
 * This function will throw if the paramater contains a sibling with different version to the one used
 * by the SDK or if no version were specified by the user.
 */
function ValidateSentryPackageParameters(packages) {
  let errorMessages = [];
  var packageFilter = /.*(capacitor|cli|wizard|typescript)/;
  for (const argPackage of packages) {
    if (argPackage.startsWith('@sentry') && !packageFilter.test(argPackage)) {
      const installedVersion = String(argPackage);
      if (installedVersion.split('@').length === 2) {
        errorMessages.push("You must specify the version to the package " + installedVersion + ". ( " + installedVersion + "@" + siblingVersion + ")");
      }
      else if (!installedVersion.endsWith(siblingVersion)) {
        errorMessages.push("You tried to install " + installedVersion + ", but the current version of  @sentry/capacitor is only compatible with version " + siblingVersion + ". Please install the dependency with the correct version.");
      }
    }
  }

  if (errorMessages.length > 0) {
    throw errorMessages.join("\n");
  }
}

/**
 * @return {String} The path where package.json is located.
 */
function GetPackageJsonRootPath() {
  if (env.INIT_CWD) {
    // Avaliable when using NPM.
    return env.INIT_CWD + '/';
  }
  let packagePath = __dirname + '/../../';
  while (!fs.existsSync(path.resolve(packagePath, 'package.json'))) {
    packagePath += '../';
  }
  return packagePath;
}

/**
 * @param {String} package The package.
 * @return {String} The path where package.json is located.
 */
function FormatPackageInstallCommand(package) {
  // Yarn
  if (env.npm_config_argv) {
    return "yarn add --exact " + package + " " + updateArgument;
  }
  else {
    // NPM
    return "npm install --save-exact " + package + " " + updateArgument;
  }
}

if (SkipPostInstall()) {
  return;
}

const siblingVersion = GetRequiredSiblingVersion();
if (siblingVersion === undefined) {
  return;
}

// Method 1: Validate user parameters when requesting to install/update a new Package.
if (env.npm_config_argv) {
  // Only available on Yarn.
  const npmAction = JSON.parse(env.npm_config_argv);
  if (npmAction.original && npmAction.original.length > 1) {
    ValidateSentryPackageParameters(npmAction.original);
    return;
  }
}

// Method 2: Validate the Package.json
let rootPath = GetPackageJsonRootPath();
let incompatiblePackages = [];
const packageJson = fs.readFileSync(rootPath + 'package.json', 'utf8').split("\n");

for (const lineData of packageJson) {
  let sentryRef = lineData.match(jsonFilter);
  if (sentryRef && sentryRef[2] !== siblingVersion) {
    incompatiblePackages.push(['@sentry/' + sentryRef[1], sentryRef[2]]);
  }
}
if (incompatiblePackages.length > 0) {
  const IncompatibilityError = ["This version of Sentry Capacitor is incompatible with the following installed packages:  "];
  let packagesList = ''
  for (const package of incompatiblePackages) {
    IncompatibilityError.push(package[0] + ' version ' + package[1]);
    packagesList += package[0] + '@' + siblingVersion + ' ';
  }
  IncompatibilityError.push("Please install the mentioned packages exactly with version " + siblingVersion + " and with the argument " + updateArgument);
  IncompatibilityError.push(FormatPackageInstallCommand(packagesList));
  throw IncompatibilityError.join("\n");
}
