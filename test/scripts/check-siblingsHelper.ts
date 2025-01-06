import { spawnSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';

export const e2ePath = path.resolve(__dirname, '../../', 'e2e-test/scripts/siblingsTests');
export const SDKPath = path.resolve(e2ePath, '.yalc/@sentry/capacitor/');

const installLogFilename = 'install.log';

/**
 * Reads a JSON file or returns an empty object if the file doesn't exist.
 * @param filePath The path to the JSON file.
 * @returns Parsed JSON object or an empty object.
 */
export const readJsonOrEmpty = (filePath: string): Record<string, any> => {
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } else {
    return {};
  }
};

export function SentryCapacitorVersion(): string {
  const packageJsonPath = path.join(SDKPath, 'package.json');
  const packageJson = readJsonOrEmpty(packageJsonPath);
  if (packageJson.version === undefined) {
    throw new Error(`Sentry Capacitor version not found on path ${packageJsonPath}`);
  }
  return packageJson.version;
}

export function ValidSentrySiblingVersion(): string {
  const packageJsonPath = path.join(SDKPath, 'package.json');
  const packageJson = readJsonOrEmpty(packageJsonPath);
  const peerDependency = packageJson.peerDependencies?.['@sentry/angular'];
  if (peerDependency === undefined) {
    throw new Error(`Sentry Capacitor version not found on path ${packageJsonPath}`);
  }
  return peerDependency;
}

export function InvalidSentrySiblingVersion(): string
{
  return '8.0.0'
};


export function ClearE2ETestFolder(testPath: string): void {
  const yarnPath = path.join(testPath, 'yarn.lock');

  if (fs.existsSync(testPath)) {
    fs.removeSync(testPath);
  }
  fs.ensureDirSync(testPath)
  fs.createFileSync(yarnPath);
}

export function GetInitialE2EPackage(testPath: string):{ [x: string]: any; }{
  const rootPackage = path.join(testPath, 'start.package.json');
  const packageManagerPath = path.join(testPath, '../', 'packagemanager.package.json');
  const e2ePackagePath = path.join(testPath, '../../', 'package.json');

  const file1 = readJsonOrEmpty(e2ePackagePath);
  const file2 = readJsonOrEmpty(packageManagerPath);
  const file3 = readJsonOrEmpty(rootPackage);

  return  {
    ...file1,
    ...file2,
    ...file3
  };

}

export function CreateE2EStartPackage(testPath: string, json: unknown): void {
  const newPackagePath = path.join(testPath, 'start.package.json');
  if (!fs.existsSync(newPackagePath)) {
    fs.createFileSync(newPackagePath);
  }
  fs.writeFileSync(newPackagePath, JSON.stringify(json, null, 2), 'utf8');
}

export function CreateE2EPackage(testPath: string): void {
  const newPackagePath = path.join(testPath, 'package.json');
  const mergedPackageJson = GetInitialE2EPackage(testPath);

  if (!fs.exists(newPackagePath)) {
    fs.createFileSync(newPackagePath);
  }
  fs.writeFileSync(newPackagePath, JSON.stringify(mergedPackageJson, null, 2), 'utf8');
}

export function InstallSDK(pkgMnger: string, args: ReadonlyArray<string>, rootPath: string): ReturnType<typeof spawnSync>
{
  const outputStream = fs.openSync(path.join(rootPath, installLogFilename), 'w');

  const nodePatch = pkgMnger === 'npm' ? {
    npm_package_json: path.join(rootPath, 'node_modules', '@sentry', 'capacitor', 'package.json')
  } : {};

  fs.writeFileSync(outputStream, `using package manager ${pkgMnger} with the following args: ${args.join(' ')}`);

  const result = spawnSync(pkgMnger, args, {
    cwd: rootPath,
    stdio: ['inherit', outputStream, outputStream], // Ensure output is in readable string format
    env: {
      // Clear env to avoid contamination with root folder.
      npm_package_scripts_test_e2e: process.env.npm_package_scripts_test_e2e,
      ...nodePatch,
      INIT_CWD: rootPath // Override INIT_CWD to match the desired root path
    },
  });
  fs.closeSync(outputStream);
  return result;
}

export function GetPackageManagerVersion(pkgMnger: string, testPath: string): string {
  const result2 = spawnSync('corepack', ['--version'], {
    cwd: testPath,
    stdio: ['pipe'], // Ensure output is in readable string format
    // Clear env to avoid contamination with root folder.
    env: {
      ...process.env,
      PATH: process.env.PATH,
      INIT_CWD: testPath
    }
  });

  if (result2.error) {
    throw new Error(` Corepack Failed.
      SpawnSync Error: ${result2.error}
      Result object: ${JSON.stringify(result2, null, 2)}

      STDERR: ${result2.stderr?.toString()}

      STDOUT: ${result2.stdout?.toString()}`);
  }
  expect(result2.status).toBe(0);
  expect(result2.stderr?.toString()).toBeEmpty();
  expect(result2.stdout.toString().trim()).not.toBeEmpty();


  const result = spawnSync(pkgMnger, ['--version'], {
    cwd: testPath,
    stdio: ['pipe'], // Ensure output is in readable string format
    // Clear env to avoid contamination with root folder.
    env: {
      ...process.env,
      PATH: process.env.PATH,
      INIT_CWD: testPath
    }
  });

  if (result.error) {
    throw new Error(` Corepack Failed.
      SpawnSync Error: ${result.error}
      Result object: ${JSON.stringify(result, null, 2)}

      STDERR: ${result.stderr?.toString()}

      STDOUT: ${result.stdout?.toString()}`);

  }
  expect(result.status).toBe(0);
  expect(result.stderr?.toString()).toBeEmpty();
  return result.stdout.toString().trim();
}

function filterYarnV3Log(str: string): string {
  const regex = /(?<=➤ YN\d{4}: [│┌└] ).*/;

  const filterV3E2ELogs = (str: string) => {
    const v3Regex = /2e2-sibling-test@workspace:. (STDOUT|STDERR) /g;
    return str.replace(v3Regex, '');
  };

  const filterNPMLE2ELogs = (str: string) => {
    const npmRegex = /npm error /g;
    return str.replace(npmRegex, '');
  };

  const match = str.match(regex);
  // ➤ YN0000: │ @sentry/capacitor...
  // to
  // @sentry/capacitor...
  return match ? filterV3E2ELogs(match[0]) : filterNPMLE2ELogs(str);
}

// For testing.
export function FilterLogs(data: string, filter: boolean): string[] {
  return data.split('\n').map(filterYarnV3Log).filter(log => filter == log.startsWith('E2E_TEST'));
}

export function GetE2ELogs(testPath: string): string[] {
  const data = fs.readFileSync(path.join(testPath, installLogFilename), 'utf8');
  return FilterLogs(data, true);
}

export function GetLogs(testPath: string): string[] {
  const data = fs.readFileSync(path.join(testPath, installLogFilename), 'utf8');
  return FilterLogs(data, false);
}
