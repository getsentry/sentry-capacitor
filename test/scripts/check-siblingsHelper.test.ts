import { FilterLogs } from './check-siblingsHelper';

describe("Yarn Classic", () => {

  test('keeps original log', () => {
    expect(FilterLogs('1234', false)).toStrictEqual(['1234']);
  });

  test('removes E2E logs', () => {
    expect(FilterLogs('E2E_TEST: Invoked', false)).toStrictEqual([]);
  });

  test('filter E2E logs', () => {
    expect(FilterLogs('E2E_TEST: Invoked', true)).toStrictEqual(['E2E_TEST: Invoked']);
  });

});

describe("Yarn V3", () => {

  test('Removes YarnV3 logs', () => {
    const str = `➤ YN0013: │ tslib@npm:2.8.1 can't be found in the cache and will be fetched from the remote registry
➤ YN0000: └ Completed
➤ YN0000: ┌ Link step
➤ YN0007: │ @sentry/capacitor@file:/run/media/user/bda233cc-061c-4aa4-af24-cbb92451e918/Dev/Sentry/sentry-capacitor/e2e-test/scripts/siblingsTests/.yalc/@sentry/capacitor#/run/media/user/bda233cc-061c-4aa4-af24-cbb92451e918/Dev/Sentry/sentry-capacitor/e2e-test/scripts/siblingsTests/.yalc/@sentry/capacitor::hash=db2148&locator=2e2-sibling-test%40workspace%3A. [fcfa0] must be built because it never has been before or the last one failed`;

    const expectStr = [`tslib@npm:2.8.1 can't be found in the cache and will be fetched from the remote registry`,
      `Completed`,
      `Link step`,
      `@sentry/capacitor@file:/run/media/user/bda233cc-061c-4aa4-af24-cbb92451e918/Dev/Sentry/sentry-capacitor/e2e-test/scripts/siblingsTests/.yalc/@sentry/capacitor#/run/media/user/bda233cc-061c-4aa4-af24-cbb92451e918/Dev/Sentry/sentry-capacitor/e2e-test/scripts/siblingsTests/.yalc/@sentry/capacitor::hash=db2148&locator=2e2-sibling-test%40workspace%3A. [fcfa0] must be built because it never has been before or the last one failed`];
    expect(FilterLogs(str, false)).toStrictEqual(expectStr);
  });

  test('Removes YarnV3 E2Elogs', () => {
    const str = `➤ YN0013: │ tslib@npm:2.8.1 can't be found in the cache and will be fetched from the remote registry
➤ YN0000: └ Completed
➤ YN0000: ┌ Link step
➤ YN0007: │ @sentry/capacitor@file:/run/media/user/bda233cc-061c-4aa4-af24-cbb92451e918/Dev/Sentry/sentry-capacitor/e2e-test/scripts/siblingsTests/.yalc/@sentry/capacitor#/run/media/user/bda233cc-061c-4aa4-af24-cbb92451e918/Dev/Sentry/sentry-capacitor/e2e-test/scripts/siblingsTests/.yalc/@sentry/capacitor::hash=db2148&locator=2e2-sibling-test%40workspace%3A. [fcfa0] must be built because it never has been before or the last one failed
➤ YN0000: │ 2e2-sibling-test@workspace:. STDOUT E2E_TEST: Invoked`;

    const expectStr = [`tslib@npm:2.8.1 can't be found in the cache and will be fetched from the remote registry`,
      `Completed`,
      `Link step`,
      `@sentry/capacitor@file:/run/media/user/bda233cc-061c-4aa4-af24-cbb92451e918/Dev/Sentry/sentry-capacitor/e2e-test/scripts/siblingsTests/.yalc/@sentry/capacitor#/run/media/user/bda233cc-061c-4aa4-af24-cbb92451e918/Dev/Sentry/sentry-capacitor/e2e-test/scripts/siblingsTests/.yalc/@sentry/capacitor::hash=db2148&locator=2e2-sibling-test%40workspace%3A. [fcfa0] must be built because it never has been before or the last one failed`];
    expect(FilterLogs(str, false)).toStrictEqual(expectStr);
  });

  test('Filter YarnV3 E2Elogs', () => {
    const str = `➤ YN0013: │ tslib@npm:2.8.1 can't be found in the cache and will be fetched from the remote registry
➤ YN0000: └ Completed
➤ YN0000: ┌ Link step
➤ YN0007: │ @sentry/capacitor@file:/run/media/user/bda233cc-061c-4aa4-af24-cbb92451e918/Dev/Sentry/sentry-capacitor/e2e-test/scripts/siblingsTests/.yalc/@sentry/capacitor#/run/media/user/bda233cc-061c-4aa4-af24-cbb92451e918/Dev/Sentry/sentry-capacitor/e2e-test/scripts/siblingsTests/.yalc/@sentry/capacitor::hash=db2148&locator=2e2-sibling-test%40workspace%3A. [fcfa0] must be built because it never has been before or the last one failed
➤ YN0000: │ 2e2-sibling-test@workspace:. STDOUT E2E_TEST: Invoked`;

    expect(FilterLogs(str, true)).toStrictEqual(['E2E_TEST: Invoked']);
  });


  test('Filter YarnV3 E2E stdout logs', () => {
    const str = `➤ YN0000: │ 2e2-sibling-test@workspace:. STDOUT E2E_TEST: Invoked`;
    expect(FilterLogs(str, true)).toStrictEqual(['E2E_TEST: Invoked']);
  });

  test('Filter YarnV3 E2E stderr logs', () => {
    const str = `➤ YN0000: │ 2e2-sibling-test@workspace:. STDERR E2E_TEST: Invoked`;
    expect(FilterLogs(str, true)).toStrictEqual(['E2E_TEST: Invoked']);
  });


});

describe("NPM V10", () => {
  test('keeps original log', () => {
    expect(FilterLogs('1234', false)).toStrictEqual(['1234']);
  });

  test('removes E2E logs', () => {
    expect(FilterLogs('npm error E2E_TEST: Invoked', false)).toStrictEqual([]);
  });

  test('filter E2E logs', () => {
    expect(FilterLogs('npm error E2E_TEST: Invoked', true)).toStrictEqual(['E2E_TEST: Invoked']);
  });
});
