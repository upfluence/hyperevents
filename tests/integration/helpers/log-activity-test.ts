import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render, setupOnerror } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { TemplateFactory } from 'ember-cli-htmlbars';

module('Integration | Helper | log-activity', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.activityTrackingService = this.owner.lookup('service:activity-tracking');
    this.acTrackStub = sinon.stub(this.activityTrackingService, 'log');
    this.templateActionStub = sinon.stub();
  });

  test('It throws an error if an @action is not passed to the modifier', async function (assert) {
    setupOnerror((err: Error) => {
      assert.equal(
        err.message,
        'Assertion Failed: [helper][log-activity] An action is required for this helper to work properly.'
      );
    });
    await render(hbs`{{log-activity "description of action"}}` as unknown as TemplateFactory);
  });

  test('It throws an error if a description is not passed to the modifier', async function (assert) {
    setupOnerror((err: Error) => {
      assert.equal(
        err.message,
        'Assertion Failed: [helper][log-activity] An actionDescription needs to be passed for the activity-log to make sense.'
      );
    });
    await render(hbs`{{log-activity this.templateActionStub}}` as unknown as TemplateFactory);
  });

  module('If @action and description are properly passed', () => {
    test('When the user triggers the click action, it calls the activity tracking service to log the activity', async function (assert) {
      await render(
        hbs`
      <button id="click-me" {{on "click" (log-activity this.templateActionStub "description of action")}}>fake button</button>
    ` as unknown as TemplateFactory
      );

      await click('#click-me');
      assert.equal(this.acTrackStub.args[0][0].action, 'description of action');
      assert.equal(this.acTrackStub.args[0][0].type, 'button_click');
      assert.true(this.acTrackStub.calledOnce);
    });

    test("It's possible to use the (fn) helper to pass extra arguments to the action method", async function (assert) {
      await render(
        hbs`
      <button id="click-me" {{on "click" (log-activity (fn this.templateActionStub 'extra-param') "description of action")}}>fake button</button>
    ` as unknown as TemplateFactory
      );

      await click('#click-me');
      assert.true(this.acTrackStub.calledOnce);
      assert.equal(this.templateActionStub.args[0][0], 'extra-param');
    });

    test("It's still possible to receive the MouseEvent using this modifier", async function (assert) {
      await render(
        hbs`
      <button id="click-me" {{on "click" (log-activity (fn this.templateActionStub 'extra-param') "description of action")}}>fake button</button>
    ` as unknown as TemplateFactory
      );

      await click('#click-me');
      assert.true(this.acTrackStub.calledOnce);
      assert.equal(this.templateActionStub.args[0][1].type, 'click');
    });
  });
});
