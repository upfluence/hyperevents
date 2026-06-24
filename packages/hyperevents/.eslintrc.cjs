'use strict';

module.exports = {
  root: true,
  ignorePatterns: ['declarations', 'dist'],
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
    'ember/no-observers': 'off'
  },
  overrides: [
    {
      files: ['addon-main.cjs', 'babel.config.cjs', '.eslintrc.cjs', '.template-lintrc.js'],
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
