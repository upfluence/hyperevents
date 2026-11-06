'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const { injectAssetMap } = require('@upfluence/oss-components/build/classic-asset-map.cjs');
const { version } = require('./package');

class IgnoreRemoteCssImports {
  install(_, pluginManager) {
    pluginManager.addPreProcessor({
      process(source) {
        return source.replace(/^@import url\(['"]https?:\/\/[^'"]+['"]\);\n?/gm, '');
      }
    });
  }
}

module.exports = function (defaults) {
  let app = new EmberApp(defaults, {
    fingerprint: {
      generateAssetMap: true,
      assetMapPath: 'assets/upfluence-asset-map.json',
      extensions: ['js', 'css', 'png', 'jpg', 'gif', 'map', 'svg', 'ico', 'woff', 'woff2', 'ttf', 'eot']
    },
    autoImport: {
      publicAssetURL: '/assets/'
    },
    lessOptions: {
      plugins: [new IgnoreRemoteCssImports()]
    },
    '@embroider/macros': {
      setConfig: {
        '@upfluence/hyperevents': {
          buildEnv: process.env.BUILD_ENV || 'staging',
          parentAppVersion: version
        }
      }
    },
    'ember-cli-uglify': {
      enabled: false
    }
  });

  return injectAssetMap(app.toTree(), {
    fingerprint: app.options.fingerprint,
    rootURL: app.project.config(app.env).rootURL
  });
};
