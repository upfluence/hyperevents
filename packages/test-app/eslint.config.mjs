// @ts-check
import { defineConfig } from 'eslint/config';
import { buildConfiguration } from '@upfluence/w-conf/eslint';

export default defineConfig(
  ...buildConfiguration({
    ignores: [
      'blueprints/*/files/',
      'vendor/',
      'dist/',
      'tmp/',
      'node_modules/',
      'coverage/',
      'declarations/',
      '.node_modules.ember-try/',
      'bower.json.ember-try',
      'package.json.ember-try',
      'package-lock.json.ember-try',
      '.eslintcache'
    ],
    nodeFiles: ['.template-lintrc.js', 'ember-cli-build.js', 'testem.js', 'config/**/*.js']
  })
);
