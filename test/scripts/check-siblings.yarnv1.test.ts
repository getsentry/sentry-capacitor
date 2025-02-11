import path from 'path';

import { ClearE2ETestFolder, CreateE2EPackage, CreateE2EStartPackage, e2ePath, GetInitialE2EPackage, GetLogs, GetPackageManagerVersion, InstallSDK, InvalidSentrySiblingVersion, readJsonOrEmpty, SDKPath, ValidSentrySiblingVersion } from './check-siblingsHelper';

const CapacitorInstallArg = `file:${SDKPath}`


describe('Yarn V1 tests', () => {
  const yarnV1e2ePath = path.join(e2ePath, 'yarn_v1');
  const PackageMangerVersion = "1.22.22";

  describe('new Install', () => {
    test('no warnings when correct sibling is installed', async () => {
      // Setup.
      const siblingVersion = ValidSentrySiblingVersion();

      const testPath = path.join(yarnV1e2ePath, 'newInstallCorrectSibling');
      const packageJsonPath = path.join(testPath, 'package.json');

      ClearE2ETestFolder(testPath);
      CreateE2EPackage(testPath);
      expect(GetPackageManagerVersion('yarn',testPath)).toBe(PackageMangerVersion);

      const expectedPackageJson = {
        ...GetInitialE2EPackage(testPath),
        dependencies: {
          '@sentry/capacitor': CapacitorInstallArg,
          '@sentry/angular': siblingVersion
        }
      };


      // Test
      const result = InstallSDK('yarn',['add', CapacitorInstallArg, `@sentry/angular@${siblingVersion}`, '--force'], testPath);
      const packageJson = readJsonOrEmpty(packageJsonPath);
      const e2eLogs = GetLogs(testPath);

      // Expect
      expect(result.status).toBe(0);
      expect(packageJson).toEqual(expectedPackageJson);
      expect(e2eLogs).toContain('E2E_TEST: OK');
    });

    test('warns when incorrect sibling is installed', async () => {
      // Setup.
      const siblingVersion = InvalidSentrySiblingVersion();

      const testPath = path.join(yarnV1e2ePath, 'newInstallIncorrectSibling');
      const packageJsonPath = path.join(testPath, 'package.json');

      ClearE2ETestFolder(testPath);
      CreateE2EPackage(testPath);
      expect(GetPackageManagerVersion('yarn',testPath)).toBe(PackageMangerVersion);

      const expectedPackageJson = {
        ...GetInitialE2EPackage(testPath),
        dependencies: {},
      };

      // Test
      const result = InstallSDK('yarn',['add', CapacitorInstallArg, `@sentry/angular@${siblingVersion}`, '--force'], testPath);
      const packageJson = readJsonOrEmpty(packageJsonPath);
      const e2eLogs = GetLogs(testPath);
      const logs = GetLogs(testPath).join('\n');

      // Expect
      expect(result.status).toBe(1);
      expect(packageJson).toEqual(expectedPackageJson);
      expect(e2eLogs).toContain('E2E_TEST: Incompatibility found');
      expect(logs).toContain(`You tried to install @sentry/angular@${siblingVersion}, but the current version of  @sentry/capacitor is only compatible with version ${ValidSentrySiblingVersion()}. Please install the dependency with the correct version.`);
    });
  });

  describe('update packages', () => {
    test('no warnings when correct sibling are updated', async () => {
      // Setup.
      const siblingVersion = ValidSentrySiblingVersion();

      const testPath = path.join(yarnV1e2ePath, 'updateCorrectSibling');
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
      expect(GetPackageManagerVersion('yarn', testPath)).toBe(PackageMangerVersion);

      const expectedPackageJson = {
        ...GetInitialE2EPackage(testPath),
        ...dependenciesJson
      };

      // Test
      const result = InstallSDK('yarn',['install'], testPath);
      const packageJson = readJsonOrEmpty(packageJsonPath);
      const e2eLogs = GetLogs(testPath);

      // Expect
      expect(result.status).toBe(0);
      expect(packageJson).toEqual(expectedPackageJson);
      expect(e2eLogs).toContain('E2E_TEST: OK');
    });

    test('warns when incorrect sibling is installed', async () => {
      // Setup.
      const siblingVersion = InvalidSentrySiblingVersion();

      const testPath = path.join(yarnV1e2ePath, 'updateInorrectSibling');
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
      expect(GetPackageManagerVersion('yarn', testPath)).toBe(PackageMangerVersion);

      const expectedPackageJson = {
        ...GetInitialE2EPackage(testPath),
        ...dependenciesJson
      };

      // Test
      const result = InstallSDK('yarn', ['install'], testPath);
      const packageJson = readJsonOrEmpty(packageJsonPath);
      const logs = GetLogs(testPath).join('\n');

      // Expect
      expect(result.status).toBe(1);
      expect(packageJson).toEqual(expectedPackageJson);
      expect(logs).toContain('E2E_TEST: Incompatibility found');
      expect(logs).toContain(`⚠️   This version of Sentry Capacitor is incompatible with the following installed packages:
@sentry/angular version ${siblingVersion}`);
      expect(logs).toContain(`yarn add --exact @sentry/angular@${ValidSentrySiblingVersion()}  --update-sentry-capacitor`);
    });

  });
});
