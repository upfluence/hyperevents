import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | activity-tracking', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let service = this.owner.lookup('service:activity-tracking');
    assert.ok(service);
  });
});
