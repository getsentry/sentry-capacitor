module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ['@sentry/sdk'],
  plugins: ['@sentry/sdk'],
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
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/unbound-method': 'off',
        'import/first': 'off',
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
    '@sentry/sdk/no-async-await': 'off',
    '@sentry/sdk/no-optional-chaining': 'off',
    '@sentry/sdk/no-nullish-coalescing': 'off',
    '@sentry/sdk/no-class-field-initializers': 'off',
  },
};
