import { spawnSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';

const e2ePath = path.resolve(__dirname, '../../', 'e2e-test/scripts/siblingsTests');
const SDKPath = path.resolve(e2ePath, '.yalc/@sentry/capacitor/');
const CapacitorInstallArg = `file:${SDKPath}`

/**
 * Reads a JSON file or returns an empty object if the file doesn't exist.
 * @param filePath The path to the JSON file.
 * @returns Parsed JSON object or an empty object.
 */
const readJsonOrEmpty = (filePath: string): Record<string, any> => {
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } else {
    return {};
  }
};

function SentryCapacitorVersion(): string {
  const packageJsonPath = path.join(SDKPath, 'package.json');
  const packageJson = readJsonOrEmpty(packageJsonPath);
  if (packageJson.version === undefined) {
    throw new Error(`Sentry Capacitor version not found on path ${packageJsonPath}`);
  }
  return packageJson.version;
}

function ValidSentrySiblingVersion(): string {
  const packageJsonPath = path.join(SDKPath, 'package.json');
  const packageJson = readJsonOrEmpty(packageJsonPath);
  const peerDependency = packageJson.peerDependencies?.['@sentry/angular'];
  if (peerDependency === undefined) {
    throw new Error(`Sentry Capacitor version not found on path ${packageJsonPath}`);
  }
  return peerDependency;
}

function ClearE2ETestFolder(testPath: string): void {
  const yarnPath = path.join(testPath, 'yarn.lock');
  const packagePath = path.join(testPath, 'package.lock');
  fs.remove(yarnPath);
  fs.remove(packagePath);
}

function GetInitialE2EPackage(testPath: string):{ [x: string]: any; }{
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

function CreateE2EPackage(testPath: string): void {
  const newPackagePath = path.join(testPath, 'package.json');
  const mergedPackageJson = GetInitialE2EPackage(testPath);
  fs.writeFileSync(newPackagePath, JSON.stringify(mergedPackageJson, null, 2), 'utf8');
}


/*
async function SetupPackageManager(rootPath: string): void
{
//  const outputStream = fs.openSync(path.join(rootPath, 'install.log'), 'w');
//  const errorStream = fs.openSync(path.join(rootPath, 'error.log'), 'w');

  const result =  spawnSync('corepack', ['prepare', pakcageManagerVersion, '--activate', '--yes'], {
    cwd: rootPath,
    stdio: 'inherit'// inherit', outputStream, errorStream], // Ensure output is in readable string format
  });
//  fs.closeSync(outputStream);
  //  fs.closeSync(errorStream);
  await wait(3); // Wait for 3 seconds
  expect(result.error).toBeEmpty();
}
*/

function InstallSDK(args: ReadonlyArray<string>, rootPath: string): ReturnType<typeof spawnSync>
{
  const outputStream = fs.openSync(path.join(rootPath, 'install.log'), 'w');
  const errorStream = fs.openSync(path.join(rootPath, 'error.log'), 'w');

  const result = spawnSync('yarn', args, {
    cwd: rootPath,
    stdio: ['inherit', outputStream, errorStream], // Ensure output is in readable string format
  });
  fs.closeSync(outputStream);
  fs.closeSync(errorStream);
  return result;
}

function InvokePostInstall(rootPath: string): ReturnType<typeof spawnSync>
{
  const outputStream = fs.openSync(path.join(rootPath, 'install.log'), 'a');
  const errorStream = fs.openSync(path.join(rootPath, 'error.log'), 'a');

  const result = spawnSync('yarn', ['install', '--force'], {
    cwd: rootPath,
    stdio: ['inherit', outputStream, errorStream], // Ensure output is in readable string format
  });
  fs.closeSync(outputStream);
  fs.closeSync(errorStream);
  return result;
}

describe('Yarn V1', () => {
  const yarnV1e2ePath = path.join(e2ePath, 'yarn_v1');

  describe('new Install', () => {
    test('no warnings when correct sibling is installed', async () => {
      // Setup.
      const capacitorVersion = SentryCapacitorVersion();
      const siblingVersion = ValidSentrySiblingVersion();

      const testPath = path.join(yarnV1e2ePath, 'correct_sibling');
      const packageJsonPath = path.join(testPath, 'package.json');

      const expectedPackageJson = {
        ...GetInitialE2EPackage(testPath),
        dependencies: {
          '@sentry/capacitor': CapacitorInstallArg,
          '@sentry/angular': siblingVersion
        }
       };
      ClearE2ETestFolder(testPath);
      CreateE2EPackage(testPath);
//      await SetupPackageManager(testPath);

      // Test
      const result = InstallSDK(['add',  CapacitorInstallArg ,`@sentry/angular@${siblingVersion}`, '--force'], testPath);
      const packageJson = readJsonOrEmpty(packageJsonPath);
      const postInstallResult = InvokePostInstall(testPath);

      // Expect
      expect(result.status).toBe(0);
      expect(postInstallResult.status).toBe(0);
      expect(packageJson).toEqual(expectedPackageJson);
    });

  });
});
