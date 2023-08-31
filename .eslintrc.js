module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ['@sentry-internal/sdk'],
  plugins: ['@sentry-internal/sdk'],
  parserOptions: {
    project: './tsconfig.json',
  },
  settings: {
    version: 'detect',
  },
  overrides: [
    {
      // Typescript Files
      files: ['*.ts'],
      rules: {
        '@typescript-eslint/typedef': [
          'error',
          { arrowParameter: false, variableDeclarationIgnoreFunction: true },
        ],
      },
    },
    {
      // Test Files
      files: ['*.test.ts', '*.test.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
    {
      // Scripts
      files: ['scripts/*'],
      parserOptions: {
        ecmaVersion: 2015,
      },
      rules: {
        'no-console': 'off',
      },
    },
  ],
  rules: {
    '@sentry-internal/sdk/no-async-await': 'off',
    '@sentry-internal/sdk/no-optional-chaining': 'off',
    '@sentry-internal/sdk/no-nullish-coalescing': 'off',
    '@sentry-internal/sdk/no-class-field-initializers': 'off',
  },
};
