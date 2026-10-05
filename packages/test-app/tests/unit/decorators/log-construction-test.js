import EmberObject from '@ember/object';

import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { logConstruction } from 'test-app/decorators/log-construction';

function instantiateWithOwner(owner, Klass) {
  owner.register('test:with-decorator', Klass);

  return owner.lookup('test:with-decorator');
}

module('Unit | Decorators | @logConstruction', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    const activityTrackingService = this.owner.lookup('service:activity-tracking');
    this.logStub = sinon.stub(activityTrackingService, 'log');
  });

  test('The decorator is defined', function (assert) {
    assert.ok(logConstruction);
  });

  test('The activity-tracking service logger is called in the ctor', function (assert) {
    @logConstruction('xxx')
    class TestWithDecorator extends EmberObject {}

    instantiateWithOwner(this.owner, TestWithDecorator);

    assert.true(this.logStub.calledOnceWithExactly('page_view', 'xxx'));
  });

  test('The original Ctor code is still executed', function (assert) {
    @logConstruction('description of the action')
    class TestWithDecorator extends EmberObject {
      randomMethod = sinon.stub();

      constructor() {
        super(...arguments);
        this.randomMethod();
      }
    }

    const instance = instantiateWithOwner(this.owner, TestWithDecorator);

    assert.true(instance.randomMethod.calledOnceWithExactly());
  });

  test('The default actionType is page_view if none is specified', function (assert) {
    @logConstruction('description of the action')
    class TestWithDecorator extends EmberObject {}

    instantiateWithOwner(this.owner, TestWithDecorator);

    assert.true(this.logStub.calledOnceWithExactly('page_view', 'description of the action'));
  });

  test('Specifying an actionType sets it in the activityTracking.log call', function (assert) {
    @logConstruction('description of the action', 'component_view')
    class TestWithDecorator extends EmberObject {}

    instantiateWithOwner(this.owner, TestWithDecorator);

    assert.true(this.logStub.calledOnceWithExactly('component_view', 'description of the action'));
  });

  test('An error is thrown if the actionDescription is not set', function (assert) {
    @logConstruction()
    class TestWithDecorator extends EmberObject {}

    assert.throws(
      () => {
        instantiateWithOwner(this.owner, TestWithDecorator);
      },
      new Error(
        'Assertion Failed: [decorator][log-construction] An actionDescription needs to be passed for the activity-log to make sense.'
      ),
      'Expect an error with this message'
    );

    assert.expect(1);
  });
});
