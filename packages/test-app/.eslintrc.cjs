'use strict';

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
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
    'ember/no-observers': 'off',
    'ember/no-jquery': 'off'
  },
  overrides: [
    {
      files: ['.eslintrc.cjs', '.template-lintrc.js', 'ember-cli-build.js', 'testem.js', 'config/**/*.js'],
      parserOptions: {
        sourceType: 'script'
      },
      env: {
        browser: false,
        node: true
      },
      plugins: ['node']
    }
  ]
};
