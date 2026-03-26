// @ts-ignore
import { setApplication } from '@ember/test-helpers';

// @ts-ignore
import { forceModulesToBeLoaded, sendCoverage } from 'ember-cli-code-coverage/test-support';
import { start } from 'ember-qunit';
import * as QUnit from 'qunit';
import { setup } from 'qunit-dom';

import Application from '../app';
// @ts-ignore
import config from '../config/environment';

setup(QUnit.assert);

// @ts-ignore
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
