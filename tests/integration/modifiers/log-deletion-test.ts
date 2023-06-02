import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, setupOnerror, waitFor } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import { set } from '@ember/object';

module('Integration | Modifiers | modifiers/log-deletion', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.activityTrackingService = this.owner.lookup('service:activity-tracking');
    this.acTrackStub = sinon.stub(this.activityTrackingService, 'log');
  });

  test('it logs the activity when the element is removed from the DOM', async function (assert) {
    set(this, 'visible', true);
    await render(hbs`
    {{#if this.visible}}
      <div id="destroy-me" {{log-deletion "description to log"}}></div>
    {{else}}
      <div id="target-helper"></div>
    {{/if}}
    `);

    set(this, 'visible', false);
    await waitFor('#target-helper');
    await settled();

    assert.true(this.acTrackStub.calledOnce);
    assert.equal(this.acTrackStub.args[0][0], 'component_view');
    assert.equal(this.acTrackStub.args[0][1], 'description to log');
  });

  test('it throws an error if the actionDescription is not passed', async function (assert) {
    set(this, 'visible', true);
    setupOnerror((err: Error) => {
      assert.equal(
        err.message,
        'Assertion Failed: [modifier][log-deletion] An actionDescription needs to be passed for the activity-log to make sense.'
      );
    });
    await render(hbs`
    {{#if this.visible}}
      <div id="destroy-me" {{log-deletion}}></div>
    {{else}}
      <div id="target-helper"></div>
    {{/if}}
    `);

    set(this, 'visible', false);
    await waitFor('#target-helper');
    await settled();
  });
});
