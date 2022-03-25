import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { settled } from '@ember/test-helpers';
import { prefixPath, exactPath } from 'hyperevents/services/events-service';

const eventPayload: any = {
  resource: '/toto',
  payload: {
    foo: 'bar'
  }
};

class MockSocket {
  callbacks: any = {};

  addEventListener(param: any, func: any) {
    this.callbacks[param] = func;
  }

  close() {}

  send() {}
}

module('Unit | Service | events', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.service = this.owner.lookup('service:events-service');
    this.mockedSocket = new MockSocket();
    this.service._buildSocket = () => {
      return this.mockedSocket;
    };
    this.service._backoffDelay = () => {
      return 0;
    };
  });

  test('it exists', async function (assert) {
    assert.ok(this.service);
  });

  test('When the socket is connected it notifies the "onConnected()" subscribers', async function (assert) {
    this.connected = false;

    this.service.establishConnection('/fakeurl');
    await settled();

    this.service.onConnected().subscribe(() => {
      this.connected = true;
    });

    this.mockedSocket.callbacks['open']();
    assert.true(this.connected);
  });

  test('The connection is retried if the socket connection fails', async function (assert) {
    this.pass = false;
    this.connected = false;

    this.service._buildSocket = () => {
      if (!this.pass) {
        this.pass = true;
        throw new Error('fake error');
      }
      return this.mockedSocket;
    };

    this.service.establishConnection('/fakeurl');
    await settled();
    this.service.onConnected().subscribe(() => {
      this.connected = true;
    });
    this.mockedSocket.callbacks['open']();
    assert.true(this.connected);
  });

  module('with a connected socket', function (hooks) {
    hooks.beforeEach(async function () {
      this.service.establishConnection('/fakeurl');
      await settled();
    });

    test('When the socket is disconnected it notifies the "onDisconnected()" subscribers', function (assert) {
      this.disconnected = false;

      this.service.onDisconnected().subscribe(() => {
        this.disconnected = true;
      });

      this.mockedSocket.callbacks['close'](new CloseEvent('close', { code: 1000 }));
      assert.true(this.disconnected);
    });

    test('The connection is closed when the terminateConnection() method is called', function (assert) {
      this.mockedSocket.close = (code: any, reason: string) => {
        assert.equal(code, 1000);
        assert.equal(reason, 'user-requested-closure');
      };

      this.service.terminateConnection();
    });

    test('Dispatches events when received from the socket', function (assert) {
      const observer1 = this.service.watch(prefixPath('/toto'));
      const observer2 = this.service.watch(prefixPath('/toto'));

      observer1.subscribe((evt: any) => {
        assert.deepEqual(eventPayload, evt);
      });

      observer2.subscribe((evt: any) => {
        assert.deepEqual(eventPayload, evt);
      });

      this.mockedSocket.callbacks['message']({
        data: JSON.stringify(eventPayload)
      });

      assert.expect(2);
    });

    test('Unsubscribe stops listening for incoming events', function (assert) {
      const observer = this.service.watch(prefixPath('/toto'));

      this.callcount = 0;
      observer.subscribe((_: any) => {
        this.callcount++;
      });
      this.mockedSocket.callbacks['message']({
        data: JSON.stringify(eventPayload)
      });
      assert.equal(this.callcount, 1);
      observer.unsubscribe();
      this.mockedSocket.callbacks['message']({
        data: JSON.stringify(eventPayload)
      });
      assert.equal(this.callcount, 1);
    });

    test('ExactPath matches an exact resource path', function (assert) {
      const observer1 = this.service.watch(exactPath('/toto'));
      const observer2 = this.service.watch(exactPath('/toto/1'));
      // the obs2 with exactPath math on '/toto/1' will never trigger since the eventPayload is set to '/toto' ressource

      observer1.subscribe((evt: any) => {
        assert.deepEqual(eventPayload, evt);
      });
      observer2.subscribe(() => {
        assert.true(false); // will trigger a failure if it is called
      });
      this.mockedSocket.callbacks['message']({
        data: JSON.stringify(eventPayload)
      });
      assert.expect(1);
    });

    test('prefixPath matches an exact resource path', function (assert) {
      const observer1 = this.service.watch(prefixPath('/to'));
      const observer2 = this.service.watch(prefixPath('/toto'));
      const observer3 = this.service.watch(prefixPath('/toto/1'));

      observer1.subscribe((evt: any) => {
        assert.deepEqual(eventPayload, evt);
      });
      observer2.subscribe((evt: any) => {
        assert.deepEqual(eventPayload, evt);
      });
      observer3.subscribe(() => {
        assert.true(false); // will trigger a failure if it is called
      });
      this.mockedSocket.callbacks['message']({
        data: JSON.stringify(eventPayload)
      });
      assert.expect(2);
    });

    test('If the connection is not closed by the user, then the connection is retried', async function (assert) {
      this.connected = false;
      this.service._buildSocket = () => {
        assert.true(true);
        return this.mockedSocket;
      };
      this.mockedSocket.callbacks['close']({ code: 1006, reason: 'god-requested-closure' });
      await settled();
    });
  });
});
