import { setApplication } from '@ember/test-helpers';

// @ts-expect-error: coverage support does not provide compatible type declarations
import { forceModulesToBeLoaded, sendCoverage } from 'ember-cli-code-coverage/test-support';
import { start } from 'ember-qunit';
import * as QUnit from 'qunit';
import { setup } from 'qunit-dom';

import Application from 'test-app/app';

import config from '../config/environment';

setup(QUnit.assert);

// @ts-expect-error: the Ember application config type is incompatible with the test helper
setApplication(Application.create(config.APP));
QUnit.done(async function () {
  forceModulesToBeLoaded();
  await sendCoverage();
});

start();

declare module 'ember-test-helpers' {
  interface TestContext {
    [key: string]: any;
  }
}
