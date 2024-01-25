import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';

module('Integration | Helper | log-activity', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.activityTrackingService = this.owner.lookup('service:activity-tracking');
    this.acTrackStub = sinon.stub(this.activityTrackingService, 'log');
    this.templateActionStub = sinon.stub();
  });

  module('If @action and description are properly passed', () => {
    test('When the user triggers the click action, it calls the activity tracking service to log the activity', async function (assert) {
      await render(
        hbs`<button id="click-me" {{on "click" (log-activity this.templateActionStub "description of action")}}>fake button</button>`
      );
      await click('#click-me');
      assert.equal(this.acTrackStub.args[0][0], 'button_click');
      assert.equal(this.acTrackStub.args[0][1], 'description of action');
      assert.true(this.acTrackStub.calledOnce);
    });
    test("It's possible to use the (fn) helper to pass extra arguments to the action method", async function (assert) {
      await render(
        hbs`<button id="click-me" {{on "click" (log-activity (fn this.templateActionStub 'extra-param') "description of action")}}>fake button</button>`
      );
      await click('#click-me');
      assert.true(this.acTrackStub.calledOnce);
      assert.equal(this.templateActionStub.args[0][0], 'extra-param');
    });
    test("It's still possible to receive the MouseEvent using this modifier", async function (assert) {
      await render(
        hbs`<button id="click-me" {{on "click" (log-activity (fn this.templateActionStub 'extra-param') "description of action")}}>fake button</button>`
      );
      await click('#click-me');
      assert.true(this.acTrackStub.calledOnce);
      assert.equal(this.templateActionStub.args[0][1].type, 'click');
    });
  });
});
