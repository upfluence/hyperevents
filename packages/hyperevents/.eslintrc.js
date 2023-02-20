'use strict';

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      legacyDecorators: true
    }
  },
  plugins: ['ember'],
  extends: ['eslint:recommended', 'plugin:ember/recommended', 'plugin:prettier/recommended'],
  env: {
    browser: true
  },
  rules: {
    'no-multiple-empty-lines': [2, { max: 1 }]
  },
  overrides: [
    // Node files
    {
      files: [
        './.eslintrc.js',
        './.prettierrc.js',
        './.template-lintrc.js',
        './addon-main.cjs',
        './blueprints/*/index.js',
        './rollup.config.mjs'
      ],
      env: {
        browser: false,
        node: true
      },
      extends: ['plugin:n/recommended']
    }
  ]
};
