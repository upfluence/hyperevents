import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import { logConstruction } from 'dummy/decorators/log-construction';

module('Unit | Decorators | @logConstruction', function (hooks) {
  setupTest(hooks);

  test('The decorator is defined', function (assert) {
    assert.ok(logConstruction);
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
    @logConstruction('xxx')
    class TestWithDecorator {}

    new TestWithDecorator();
    assert.true(this.logStub.calledOnce);
    assert.equal(this.logStub.args[0][1], 'xxx');
  });

  test('The original Ctor code is still executed', function (assert) {
    @logConstruction('description of the action')
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
    @logConstruction('description of the action')
    class TestWithDecorator {}

    new TestWithDecorator();
    assert.true(this.logStub.calledOnce);
    assert.equal(this.logStub.args[0][0], 'page_view');
    assert.equal(this.logStub.args[0][1], 'description of the action');
  });

  test('Specifying an actionType sets it in the activityTracking.log call', function (assert) {
    @logConstruction('description of the action', 'component_view')
    class TestWithDecorator {}

    new TestWithDecorator();
    assert.true(this.logStub.calledOnce);
    assert.equal(this.logStub.args[0][0], 'component_view');
    assert.equal(this.logStub.args[0][1], 'description of the action');
  });

  test('An error is thrown if the actionDescription is not set', function (assert) {
    @logConstruction()
    class TestWithDecorator {}

    assert.throws(
      () => {
        new TestWithDecorator();
      },
      new Error(
        'Assertion Failed: [decorator][log-construction] An actionDescription needs to be passed for the activity-log to make sense.'
      ),
      'Expect an error with this message'
    );

    assert.expect(1);
  });
});
