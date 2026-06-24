'use strict';

const { addonV1Shim } = require('@embroider/addon-shim');

module.exports = {
  ...addonV1Shim(__dirname),
  ...{
    options: {
      '@embroider/macros': {
        setOwnConfig: {
          buildEnv: process.env.BUILD_ENV ?? 'staging',
          activityUrl: process.env.ACTIVITY_URL ?? 'https://activity.upfluence.co/'
        }
      }
    }
  }
};
