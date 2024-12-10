import path from 'path';

import { ClearE2ETestFolder, CreateE2EPackage, CreateE2EStartPackage, e2ePath, GetE2ELogs, GetInitialE2EPackage, GetLogs, GetPackageManagerVersion, InstallSDK, InvalidSentrySiblingVersion, readJsonOrEmpty, SDKPath, ValidSentrySiblingVersion } from './check-siblingsHelper';

const CapacitorInstallArg = `file:${SDKPath}`

describe('NPM 10 tests', () => {
  const npme2ePath = path.join(e2ePath, 'npm10');

  describe('new Install', () => {
    test('no warnings when correct sibling is installed', async () => {
      // Setup.
      const siblingVersion = ValidSentrySiblingVersion();

      const testPath = path.join(npme2ePath, 'newInstallCorrectSibling');
      const packageJsonPath = path.join(testPath, 'package.json');

      ClearE2ETestFolder(testPath);
      CreateE2EPackage(testPath);
      expect(GetPackageManagerVersion('npm',testPath)).toBe("10.9.0");

      const expectedPackageJson = {
        ...GetInitialE2EPackage(testPath),
        dependencies: {
          '@sentry/capacitor': 'file:../../.yalc/@sentry/capacitor',
          '@sentry/angular': siblingVersion
        }
      };


      // Test
      const result = InstallSDK('npm',['install', '--save-exact', '--foreground-scripts', CapacitorInstallArg, `@sentry/angular@${siblingVersion}`], testPath);
      const packageJson = readJsonOrEmpty(packageJsonPath);
      const e2eLogs = GetE2ELogs(testPath);

      // Expect
      expect(result.status).toBe(0);
      expect(packageJson).toEqual(expectedPackageJson);
      expect(e2eLogs).toContain('E2E_TEST: OK');
    });

    /*
    // TODO: Fix test.
    test('warns when incorrect sibling is installed', async () => {
      // Setup.
      const siblingVersion = InvalidSentrySiblingVersion();

      const testPath = path.join(npme2ePath, 'newInstallIncorrectSibling');
      const packageJsonPath = path.join(testPath, 'package.json');

      ClearE2ETestFolder(testPath);
      CreateE2EPackage(testPath);
      expect(GetPackageManagerVersion('npm',testPath)).toBe("10.9.0");

      const expectedPackageJson = {
        ...GetInitialE2EPackage(testPath),
        dependencies: {
          '@sentry/capacitor': CapacitorInstallArg,
          '@sentry/angular': siblingVersion
        }
      };

      // Test
      InstallSDK('npm',['install', '--foreground-scripts', `@capacitor/core`], testPath);
      const result = InstallSDK('npm',['install', '--save-exact', '--foreground-scripts', CapacitorInstallArg, `@sentry/angular@${siblingVersion}`], testPath);
      const packageJson = readJsonOrEmpty(packageJsonPath);
      const e2eLogs = GetE2ELogs(testPath);
      const logs = GetLogs(testPath).join('\n');

      // Expect
      expect(result.status).toBe(1);
      expect(packageJson).toEqual(expectedPackageJson);
      expect(e2eLogs).toContain('E2E_TEST: Incompatibility found');
      expect(logs).toContain(`You tried to install @sentry/angular@${siblingVersion}, but the current version of  @sentry/capacitor is only compatible with version ${ValidSentrySiblingVersion()}. Please install the dependency with the correct version.`);
    });
    */
  });

  describe('update packages', () => {
    test('no warnings when correct sibling are updated', async () => {
      // Setup.
      const siblingVersion = ValidSentrySiblingVersion();

      const testPath = path.join(npme2ePath, 'updateCorrectSibling');
      const packageJsonPath = path.join(testPath, 'package.json');
      const dependenciesJson = {
        dependencies: {
          '@sentry/capacitor': CapacitorInstallArg,
          '@sentry/angular': siblingVersion
        }
      };

      ClearE2ETestFolder(testPath);
      CreateE2EStartPackage(testPath, dependenciesJson);
      CreateE2EPackage(testPath);
      expect(GetPackageManagerVersion('npm', testPath)).toBe("10.9.0");

      const expectedPackageJson = {
        ...GetInitialE2EPackage(testPath),
        ...dependenciesJson
      };

      // Test
      const result = InstallSDK('npm',['install'], testPath);
      const packageJson = readJsonOrEmpty(packageJsonPath);
      const e2eLogs = GetE2ELogs(testPath);

      // Expect
      expect(result.status).toBe(0);
      expect(packageJson).toEqual(expectedPackageJson);
      expect(e2eLogs).toContain('E2E_TEST: OK');
    });

    test('warns when incorrect sibling is installed', async () => {
      // Setup.
      const siblingVersion = InvalidSentrySiblingVersion();

      const testPath = path.join(npme2ePath, 'updateInorrectSibling');
      const packageJsonPath = path.join(testPath, 'package.json');
      const dependenciesJson = {
        dependencies: {
          '@sentry/capacitor': CapacitorInstallArg,
          '@sentry/angular': siblingVersion
        }
      };

      ClearE2ETestFolder(testPath);
      CreateE2EStartPackage(testPath, dependenciesJson);
      CreateE2EPackage(testPath);
      expect(GetPackageManagerVersion('npm', testPath)).toBe("10.9.0");

      const expectedPackageJson = {
        ...GetInitialE2EPackage(testPath),
        ...dependenciesJson
      };

      // Test
      const result = InstallSDK('npm', ['install'], testPath);
      const packageJson = readJsonOrEmpty(packageJsonPath);
      const e2eLogs = GetE2ELogs(testPath);
      const logs = GetLogs(testPath).join('\n');

      // Expect
      expect(result.status).toBe(1);
      expect(packageJson).toEqual(expectedPackageJson);
      expect(e2eLogs).toContain('E2E_TEST: Incompatibility found');
      expect(logs).toContain(`⚠️   This version of Sentry Capacitor is incompatible with the following installed packages:
@sentry/angular version ${siblingVersion}`);
      expect(logs).toContain(`npm install --save-exact @sentry/angular@${ValidSentrySiblingVersion()}  --update-sentry-capacitor`);
    });
  });
});
