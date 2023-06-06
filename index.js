'use strict';

const { name, version } = require('./package');
const MergeTrees = require('broccoli-merge-trees');
const writeFile = require('broccoli-file-creator');

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
        buildEnv: process.BUILD_ENV || 'staging'
      }
    }
  },

  config(env, baseConfig) {
    const config = this._super.config.apply(this, arguments);

    if (baseConfig.APP && deployedApps.includes(baseConfig.APP.name) && baseConfig.APP.version) {
      this.options['@embroider/macros'].setOwnConfig.parentAppVersion = baseConfig.APP.version;
    }

    return config;
  },

  included: function () {
    this._super.included.apply(this, arguments);

    this.import('vendor/@upfluence/hypertable/register-version.js');
  },

  treeForVendor(vendorTree) {
    let trees = [];

    if (vendorTree) {
      trees.push(vendorTree);
    }

    trees.push(
      writeFile('@upfluence/hypertable/register-version.js', `Ember.libraries.register('${name}', '${version}');`)
    );

    return new MergeTrees(trees);
  }
};
