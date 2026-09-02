// @ts-check
import { buildConfiguration } from '@upfluence/w-conf/eslint';

export default buildConfiguration(
  {
    ignores: ['packages/hyperevents/dist/', 'packages/hyperevents/declarations/', 'packages/*/dist/'],
    testFiles: ['packages/*/tests/**/*-test.{js,ts}'],
    nodeFiles: [
      'packages/hyperevents/addon-main.cjs',
      'packages/hyperevents/babel.config.cjs',
      'packages/hyperevents/.template-lintrc.js',
      'packages/test-app/.template-lintrc.js',
      'packages/test-app/ember-cli-build.js',
      'packages/test-app/testem.js',
      'packages/test-app/config/ember-try.js',
      'packages/test-app/config/environment.js',
      'packages/test-app/config/targets.js'
    ]
  },
  {
    files: ['packages/hyperevents/rollup.config.mjs'],
    languageOptions: {
      globals: {
        process: 'readonly'
      }
    }
  }
);
