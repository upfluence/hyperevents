'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
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

  return app.toTree();
};
