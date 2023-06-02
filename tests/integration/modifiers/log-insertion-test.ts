import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, setupOnerror } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';

module('Integration | Modifiers | modifiers/log-insertion', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.activityTrackingService = this.owner.lookup('service:activity-tracking');
    this.acTrackStub = sinon.stub(this.activityTrackingService, 'log');
  });

  test('it logs the activity when the element is rendered', async function (assert) {
    await render(hbs`
      <div {{log-insertion "description to log"}}></div>
    `);

    assert.equal(this.acTrackStub.args[0][0], 'component_view');
    assert.equal(this.acTrackStub.args[0][1], 'description to log');
    assert.true(this.acTrackStub.calledOnce);
  });

  test('it throws an error if the actionDescription is not passed', async function (assert) {
    setupOnerror((err: Error) => {
      assert.equal(
        err.message,
        'Assertion Failed: [modifier][log-insertion] An actionDescription needs to be passed for the activity-log to make sense.'
      );
    });
    await render(hbs`
      <div {{log-insertion}}></div>
    `);
  });
});
