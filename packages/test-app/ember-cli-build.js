'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function (defaults) {
  const app = new EmberApp(defaults, {
    autoImport: {
      watchDependencies: ['@upfluence/hyperevents']
    }
  });

  // eslint-disable-next-line
  const { maybeEmbroider } = require('@embroider/test-setup');

  return maybeEmbroider(app);
};
