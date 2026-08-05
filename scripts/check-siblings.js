const fs = require('fs');
const path = require('path');
const { env, exit, platform } = require('process');

// Deprecated: a `--update-sentry-capacitor` CLI flag passed to `yarn add`/`npm install` to skip this
// check during an intentional sibling bump. Yarn 2+ (Berry) rejects unrecognized CLI flags outright, so
// this only ever worked on Yarn Classic and npm (which auto-converts unknown flags into `npm_config_*`
// env vars for lifecycle scripts). Kept only for backwards compatibility; will be removed in the next
// major version - use the `updateArgument` env var below instead.
const legacyUpdateArgument = '--update-sentry-capacitor';
// Environment variable that skips this check during an intentional sibling bump. Works the same way
// regardless of package manager or Yarn version.
const updateArgument = 'UPDATE_SENTRY_CAPACITOR';

// Filters all Sentry packages but Capacitor, CLI and Wizard.
const jsonFilter = /\s*\"\@sentry\/(?!capacitor|wizard|cli|typescript|electron)(?<packageName>[a-zA-Z]+)\"\:\s*\"(?<version>.+)\"/;

/**
 * If user requested to ignore the post-install
 * @return {Boolean} true if requested to skip the post-install check, false otherwise.
 */
function SkipPostInstall() {
  if (env[updateArgument]) {
    return true;
  }
  if (env.npm_config_update_sentry_capacitor) {
    // NPM, legacy --update-sentry-capacitor flag.
    return true;
  }
  else if (env.npm_config_argv && env.npm_config_argv.includes(legacyUpdateArgument)) {
    // Yarn Classic, legacy --update-sentry-capacitor flag.
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
    // Yarn V1.
    return env.npm_package_dependencies__sentry_browser;
  }

  let capacitorPackagePath = '';
  if (__dirname) {
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
function ValidateSentryPackageParameters(packages, siblingVersion) {
  let errorMessages = [];
  var packageFilter = /.*(capacitor|cli|wizard|typescript)/;
  for (const argPackage of packages) {
    if (argPackage.startsWith('@sentry') && !packageFilter.test(argPackage)) {
      const installedVersion = String(argPackage);
      if (installedVersion.split('@').length === 2) {
        errorMessages.push("You must specify the version to the package " + installedVersion + ". ( " + installedVersion + "@" + siblingVersion + ")");
      }
      else if (!installedVersion.endsWith(siblingVersion) && !installedVersion.includes('%3A' + siblingVersion + '#')) {
        errorMessages.push("You tried to install " + installedVersion + ", but the current version of  @sentry/capacitor is only compatible with version " + siblingVersion + ". Please install the dependency with the correct version.");
      }
    }
  }

  if (errorMessages.length > 0) {
    console.error(`⚠️   ${errorMessages.join("\n")}`);
    exit(1);
  }
}

/**
 * @return {String} The path where package.json is located.
 */
function GetPackageJsonRootPath() {

  // Avaliable when using NPM.
  if (env.INIT_CWD) {
    // Avaliable when using NPM.
    return env.INIT_CWD + '/';
  }

  // Unix only.
  if (env.PWD) {
    return env.PWD + '/';
  }

  let packagePath = __dirname + '/../../';
  while (!fs.existsSync(path.resolve(packagePath, 'package.json'))) {
    packagePath += '../';
  }
  return packagePath;
}

/**
 * @param {String} sentryPackages The sibling packages (with the required version) to install.
 * @return {String} The command(s) to run, with `updateArgument` set, to install the given packages
 * while skipping this check.
 */
function FormatPackageInstallCommand(sentryPackages) {
  // Yarn V1 || Yarn V3/V4.
  const isYarn = env.npm_config_argv || env.npm_config_user_agent?.startsWith('yarn');
  const command = isYarn
    ? "yarn add --exact " + sentryPackages
    : "npm install --save-exact " + sentryPackages;

  if (platform === 'win32') {
    return `set ${updateArgument}=1&& ${command}\n` +
      `  or, in PowerShell: $env:${updateArgument}=1; ${command}`;
  }
  return `${updateArgument}=1 ${command}`;
}

function CheckSiblings() {
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
      ValidateSentryPackageParameters(npmAction.original, siblingVersion);
      return;
    }
  }

  // Method 2: Validate the Package.json
  let rootPath = GetPackageJsonRootPath();
  let incompatiblePackages = [];
  const packageJson = fs.readFileSync(rootPath + 'package.json', 'utf8').split("\n");
  for (const lineData of packageJson) {
    let sentryRef = lineData.match(jsonFilter);
    if (sentryRef && sentryRef[2] !== siblingVersion && !sentryRef[2].includes('%3A' + siblingVersion + '#')) {
      incompatiblePackages.push(['@sentry/' + sentryRef[1], sentryRef[2]]);
    }
  }
  if (incompatiblePackages.length > 0) {
    const IncompatibilityError = ["This version of Sentry Capacitor is incompatible with the following installed packages:"];
    let packagesList = ''
    for (const sentryPackage of incompatiblePackages) {
      IncompatibilityError.push(sentryPackage[0] + ' version ' + sentryPackage[1]);
      packagesList += sentryPackage[0] + '@' + siblingVersion + ' ';
    }
    IncompatibilityError.push(
      `Please install the mentioned packages exactly with version ${siblingVersion} and with the environment variable ${updateArgument} set.
Your project will build with the wrong package but you may face Runtime errors.
You can use the below command to fix your package.json:`);

    console.error(`⚠️   ${IncompatibilityError.join("\n")}`);
    console.warn(`  ${FormatPackageInstallCommand(packagesList)}`);
    exit(1);
  }
}

CheckSiblings();
