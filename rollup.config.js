import nodeResolve from '@rollup/plugin-node-resolve';

export default {
  input: 'dist/esm/index.js',
  output: {
    file: 'dist/plugin.js',
    format: 'iife',
    name: 'capacitorPlugin', // TODO: change this
    globals: {
      '@capacitor/core': 'capacitorExports',
      'tslib': 'tslib',
      '@sentry/types': 'types',
      '@sentry/core': 'core',
      '@sentry/utils': 'utils',
      '@sentry/browser': 'browser',
      '@sentry/browser/dist/backend': 'backend',
      '@sentry/hub': 'hub',
      '@sentry/integrations': 'integrations'
    },
    sourcemap: true,
  },
  plugins: [
    nodeResolve({
      // allowlist of dependencies to bundle in
      // @see https://github.com/rollup/plugins/tree/master/packages/node-resolve#resolveonly
      resolveOnly: ['lodash'],
    }),
  ],
};
