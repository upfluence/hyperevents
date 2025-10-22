'use strict';

module.exports = function (environment, appConfig) {
  appConfig.activity_url = process.env.ACTIVITY_URL || 'https://activity.upfluence.co';

  return {
    modulePrefix: '@upfluence/hyperevents'
  };
};
