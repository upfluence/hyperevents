import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import { trackOnConstructor } from 'dummy/decorators/track-on-constructor';

module('Unit | Decorators | @trackOnConstructor', function (hooks) {
  setupTest(hooks);

  test('The decorator is defined', function (assert) {
    assert.ok(trackOnConstructor);
  });

  hooks.beforeEach(function () {
    this.logStub = sinon.stub();
    // Stubbing getOwner to be able to set an ActivityTracking.log stub :)
    // eslint-disable-next-line no-undef
    this.getOwnerStub = sinon.stub(Ember, 'getOwner').returns({
      lookup: () => {
        return { log: this.logStub };
      }
    });
  });

  hooks.afterEach(function () {
    this.getOwnerStub.restore();
  });

  test('The activity-tracking service logger is called in the ctor', function (assert) {
    @trackOnConstructor('xxx')
    class TestWithDecorator {}

    new TestWithDecorator();
    assert.true(this.logStub.calledOnce);
    assert.equal(this.logStub.args[0][0].action, 'xxx');
  });

  test('The original Ctor code is still executed', function (assert) {
    @trackOnConstructor('description of the action')
    class TestWithDecorator {
      randomMethod = sinon.stub();
      constructor() {
        this.randomMethod();
      }
    }
    let testClass = new TestWithDecorator();
    assert.true(testClass.randomMethod.calledOnce);
  });

  test('The default actionType is page_view if none is specified', function (assert) {
    @trackOnConstructor('description of the action')
    class TestWithDecorator {}

    new TestWithDecorator();
    assert.true(this.logStub.calledOnce);
    assert.equal(this.logStub.args[0][0].action, 'description of the action');
    assert.equal(this.logStub.args[0][0].type, 'page_view');
  });

  test('Specifying an actionType sets it in the activityTracking.log call', function (assert) {
    @trackOnConstructor('description of the action', 'component_view')
    class TestWithDecorator {}

    new TestWithDecorator();
    assert.true(this.logStub.calledOnce);
    assert.equal(this.logStub.args[0][0].action, 'description of the action');
    assert.equal(this.logStub.args[0][0].type, 'component_view');
  });

  test('An error is thrown if the actionDescription is not set', function (assert) {
    @trackOnConstructor()
    class TestWithDecorator {}

    assert.throws(
      () => {
        new TestWithDecorator();
      },
      new Error(
        'Assertion Failed: [decorator][track-on-constructor] An actionDescription needs to be passed for the activity-log to make sense.'
      ),
      'Expect an error with this message'
    );

    assert.expect(1);
  });
});
