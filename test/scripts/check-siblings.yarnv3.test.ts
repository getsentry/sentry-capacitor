import fs from 'fs-extra';
import path from 'path';

import { ClearE2ETestFolder, CreateE2EPackage, CreateE2EStartPackage, e2ePath, GetE2ELogs, GetInitialE2EPackage, GetLogs, GetPackageManagerVersion, InstallSDK, InvalidSentrySiblingVersion, readJsonOrEmpty, SDKPath, ValidSentrySiblingVersion } from './check-siblingsHelper';


const CapacitorLocalVersion = `file:${SDKPath}`
const CapacitorInstallParameter = `@sentry/capacitor@${CapacitorLocalVersion}`

function SetupYarnRC(testPath: string): void {
  fs.writeFileSync(path.join(testPath, '.yarnrc.yml'), 'nodeLinker: node-modules\nenableInlineBuilds: true', 'utf-8');
}

describe('Yarn V3 tests', () => {
  const yarnV3e2ePath = path.join(e2ePath, 'yarn_v3');

  describe('new Install', () => {
    test('no warnings when correct sibling is installed', async () => {
      // Setup.
      const siblingVersion = ValidSentrySiblingVersion();

      const testPath = path.join(yarnV3e2ePath, 'newInstallCorrectSibling');
      const packageJsonPath = path.join(testPath, 'package.json');

      ClearE2ETestFolder(testPath);
      CreateE2EPackage(testPath);
      SetupYarnRC(testPath);
//      InstallSDK('corepack',['prepare', '--activate'], testPath);
//      expect(GetPackageManagerVersion('yarn', testPath)).toBe("3.8.6");

      const expectedPackageJson = {
        ...GetInitialE2EPackage(testPath),
        dependencies: {
          '@sentry/capacitor': CapacitorLocalVersion,
          '@sentry/angular': siblingVersion
        }
      };


      // Test
      const result = InstallSDK('yarn', ['add', CapacitorInstallParameter, `@sentry/angular@${siblingVersion}`], testPath);
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

      const testPath = path.join(yarnV3e2ePath, 'newInstallIncorrectSibling');
      const packageJsonPath = path.join(testPath, 'package.json');

      ClearE2ETestFolder(testPath);
      CreateE2EPackage(testPath);
      SetupYarnRC(testPath);
//      InstallSDK('corepack',['prepare', '--activate'], testPath);
//      expect(GetPackageManagerVersion('yarn',testPath)).toBe("3.8.6");

      const expectedPackageJson = {
        ...GetInitialE2EPackage(testPath),
        dependencies: {
          '@sentry/capacitor': CapacitorLocalVersion,
          '@sentry/angular': siblingVersion
        }
      };

      // Test
      const result = InstallSDK('yarn', ['add', CapacitorInstallParameter, `@sentry/angular@${siblingVersion}`], testPath);
      const packageJson = readJsonOrEmpty(packageJsonPath);
      const e2eLogs = GetE2ELogs(testPath);
      const logs = GetLogs(testPath).join('\n');

      // Expect
      expect(result.status).toBe(1);
      expect(packageJson).toEqual(expectedPackageJson);
      expect(e2eLogs).toContain('E2E_TEST: Incompatibility found');
      expect(logs).toContain(`⚠️   This version of Sentry Capacitor is incompatible with the following installed packages:`);
      expect(logs).toContain(`@sentry/angular version ${siblingVersion}`);
      expect(logs).toContain(`Please install the mentioned packages exactly with version ${ValidSentrySiblingVersion()} and with the argument --update-sentry-capacitor.`);
    });
  });

  describe('update packages', () => {
    test('no warnings when correct sibling are updated', async () => {
      // Setup.
      const siblingVersion = ValidSentrySiblingVersion();

      const testPath = path.join(yarnV3e2ePath, 'updateCorrectSibling');
      const packageJsonPath = path.join(testPath, 'package.json');
      const dependenciesJson = {
        dependencies: {
          '@sentry/capacitor': CapacitorLocalVersion,
          '@sentry/angular': siblingVersion
        }
      };

      ClearE2ETestFolder(testPath);
      CreateE2EStartPackage(testPath, dependenciesJson);
      CreateE2EPackage(testPath);
      SetupYarnRC(testPath);
//      InstallSDK('corepack',['prepare', '--activate'], testPath);
//      expect(GetPackageManagerVersion('yarn',testPath)).toBe("3.8.6");

      const expectedPackageJson = {
        ...GetInitialE2EPackage(testPath),
        ...dependenciesJson
      };


      // Test
      const result = InstallSDK('yarn', ['install'], testPath);
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

      const testPath = path.join(yarnV3e2ePath, 'updateInorrectSibling');
      const packageJsonPath = path.join(testPath, 'package.json');
      const dependenciesJson = {
        dependencies: {
          '@sentry/capacitor': CapacitorLocalVersion,
          '@sentry/angular': siblingVersion
        }
      };

      ClearE2ETestFolder(testPath);
      CreateE2EStartPackage(testPath, dependenciesJson);
      CreateE2EPackage(testPath);
      SetupYarnRC(testPath);
//      InstallSDK('corepack',['prepare', '--activate'], testPath);
//      expect(GetPackageManagerVersion('yarn',testPath)).toBe("3.8.6");

      const expectedPackageJson = {
        ...GetInitialE2EPackage(testPath),
        ...dependenciesJson
      };

      // Test
      const result = InstallSDK('yarn', ['install'], testPath);
      const packageJson = readJsonOrEmpty(packageJsonPath);
      const e2eLogs = GetE2ELogs(testPath);
      const logs = GetLogs(testPath).join('\n');

      // Expect
      expect(result.status).toBe(1);
      expect(packageJson).toEqual(expectedPackageJson);
      expect(e2eLogs).toContain('E2E_TEST: Incompatibility found');
      expect(logs).toContain(`⚠️   This version of Sentry Capacitor is incompatible with the following installed packages:
@sentry/angular version ${siblingVersion}`);
      expect(logs).toContain(`yarn add --exact @sentry/angular@${ValidSentrySiblingVersion()}  --update-sentry-capacitor`);
    });

  });
});
