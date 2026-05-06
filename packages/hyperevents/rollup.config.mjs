import { Addon } from '@embroider/addon-dev/rollup';
import { babel } from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import copy from 'rollup-plugin-copy';
import { visualizer } from 'rollup-plugin-visualizer';

const addon = new Addon({
  srcDir: 'src',
  destDir: 'dist'
});

const config = {
  output: addon.output(),

  plugins: [
    nodeResolve({
      extensions: ['.ts', '.js']
    }),

    addon.publicEntrypoints(['**/*.js', '**/*.ts']),

    addon.appReexports(
      ['decorators/**/*.js', 'helpers/**/*.js', 'initializers/**/*.js', 'modifiers/**/*.js', 'services/**/*.js'],
      {
        exports(filename) {
          if (filename === 'decorators/log-construction.js') {
            return ['logConstruction'];
          }

          return ['default'];
        }
      }
    ),

    addon.dependencies(),

    babel({
      babelHelpers: 'bundled',
      extensions: ['.js', '.ts']
    }),

    addon.hbs(),

    addon.declarations('declarations'),

    addon.keepAssets(['**/*.css']),

    addon.clean(),

    copy({
      targets: [
        { src: '../../README.md', dest: '.' },
        { src: '../../LICENSE.md', dest: '.' }
      ]
    })
  ]
};

if (process.env.DEBUG) {
  config.plugins.push(visualizer());
}

export default config;
