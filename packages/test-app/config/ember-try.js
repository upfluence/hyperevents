'use strict';

const variants = JSON.parse(process.env.EMBER_TEST_VARIANTS || '[{"name":"default","command":"pnpm -w test:ci"}]');

module.exports = async function () {
  return {
    packageManager: 'pnpm',
    command: 'pnpm -w test:ci',
    scenarios: [
      {
        name: 'ember-lts-3.28',
        npm: {
          devDependencies: {
            'ember-source': '~3.28.12',
            'ember-cli': '~3.28.6'
          }
        }
      },
      ...JSON.parse(process.env.EMBER_TRY_SCENARIOS || '[]').flatMap((scenario) =>
        variants.map((variant) => ({
          ...scenario,
          name: `${scenario.name}-${variant.name}`,
          command: variant.command
        }))
      )
    ]
  };
};
