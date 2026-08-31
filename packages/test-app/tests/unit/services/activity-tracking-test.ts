import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { THROTTLE_TIME_MS } from '@upfluence/hyperevents/services/activity-tracking';

module('Unit | Service | activity-tracking', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.service = this.owner.lookup('service:activity-tracking');
    this.service.session = {
      data: { authenticated: { access_token: 'mocked-access-token' } }
    };
    this.clock = sinon.useFakeTimers();
    this.fetchStub = sinon.stub(window, 'fetch').resolves({ ok: true, json: () => Promise.resolve() } as Response);
  });

  hooks.afterEach(function () {
    this.clock.runAll();
    this.clock.restore();
    this.fetchStub.restore();
  });

  test('it exists', function (assert) {
    const service = this.owner.lookup('service:activity-tracking');
    assert.ok(service);
  });

  test('it stringifies extra values', function (assert) {
    this.service.log('page_view', 'test-action', {
      text: 'hello',
      count: 3,
      ok: true,
      nil: null,
      missing: undefined,
      obj: { a: 1 },
      arr: [1, 2]
    });

    const [activity] = this.service.activityQueue;
    assert.deepEqual(activity.extra, {
      text: 'hello',
      count: '3',
      ok: 'true',
      nil: 'null',
      missing: 'undefined',
      obj: '[object Object]',
      arr: '1,2'
    });
  });

  test('it enqueues activities and sends them in bulk after the delay', function (assert) {
    this.service.log('page_view', 'test-action-1', {});
    this.service.log('button_click', 'test-action-2', {});
    this.service.log('button_click', 'test-action-3', {});

    assert.equal(this.fetchStub.callCount, 0, 'fetch should not be called immediately');
    this.clock.tick(THROTTLE_TIME_MS);
    assert.equal(this.fetchStub.callCount, 1, 'fetch should be called after throttle time');
    const [url, options] = this.fetchStub.firstCall.args;
    assert.equal(url, `${this.service.apiUrl}`, 'fetch should be called with correct URL');
    const body = JSON.parse(options.body);
    assert.equal(body.activities.length, 3, 'fetch should be called with all enqueued activities');
  });
});
