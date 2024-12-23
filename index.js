'use strict';

const { name, version } = require('./package');

const deployedApps = ['upfluence-web', 'creators-web', 'plugin-web', 'identity-web'];

module.exports = {
  name,
  version,

  isDevelopingAddon: function () {
    return true;
  },

  options: {
    '@embroider/macros': {
      setOwnConfig: {
        buildEnv: process.env.BUILD_ENV || 'staging'
      }
    }
  },

  included(parent) {
    this._super.included.apply(this, arguments);

    if (parent.name === 'dummy') {
      this.options.babel.plugins.push(...require('ember-cli-code-coverage').buildBabelPlugin());
    }
  },

  config(_, baseConfig) {
    const config = this._super.config.apply(this, arguments);

    if (baseConfig.APP && deployedApps.includes(baseConfig.APP.name) && baseConfig.APP.version) {
      this.options['@embroider/macros'].setOwnConfig.parentAppVersion = baseConfig.APP.version;
    }

    return config;
  }
};
