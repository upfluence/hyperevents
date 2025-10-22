import Configuration from '@upfluence/hyperevents/configuration';

export default {
  name: 'hyperevents',
  initialize: function (application) {
    if (Configuration.__initialized__) return;

    const appConfig = application.resolveRegistration('config:environment');
    const addonConfig = appConfig['@upfluence/hyperevents'] || {};

    Configuration.load(addonConfig);
  }
};
