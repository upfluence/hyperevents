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
    // node files
    {
      files: ['.eslintrc.js', '.template-lintrc.js', 'ember-cli-build.js', 'testem.js', 'config/**/*.js'],
      excludedFiles: ['app/**', 'tests/**', 'dist/**', 'tests/dummy/app/**'],
      parserOptions: {
        sourceType: 'script'
      },
      env: {
        browser: false,
        node: true
      },
      plugins: ['node'],
      rules: {}
    }
  ]
};
