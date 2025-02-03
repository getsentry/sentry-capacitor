import path from 'path';
const { execSync } = require("child_process");

import { ClearE2ETestFolder, CreateE2EPackage, CreateE2EStartPackage, e2ePath, GetE2ELogs, GetInitialE2EPackage, GetLogs, GetPackageManagerVersion, InstallSDK, InvalidSentrySiblingVersion, readJsonOrEmpty, SDKPath, ValidSentrySiblingVersion } from './check-siblingsHelper';

const CapacitorInstallArg = `file:${SDKPath}`

describe('NPM tests', () => {
  const npme2ePath = path.join(e2ePath, 'npm_default');
  const PackageMangerVersion = execSync("npm --version").toString().trim();

  describe('new Install', () => {
    test('no warnings when correct sibling is installed', async () => {
      // Setup.
      const siblingVersion = ValidSentrySiblingVersion();

      const testPath = path.join(npme2ePath, 'newInstallCorrectSibling');
      const packageJsonPath = path.join(testPath, 'package.json');

      ClearE2ETestFolder(testPath);
      CreateE2EPackage(testPath);

      expect(GetPackageManagerVersion('npm', testPath)).toBe(PackageMangerVersion);

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
      expect(GetPackageManagerVersion('npm', testPath)).toBe(PackageMangerVersion);

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
      expect(GetPackageManagerVersion('npm', testPath)).toBe(PackageMangerVersion);

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
