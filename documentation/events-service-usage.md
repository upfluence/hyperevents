# Events service

This document gives information about how to use and test the events service.

## Set up the project

### Update dependencies

Add `"@upfluence/hyperevents": "^0.x"` in dependencies in the `package.json`.

### Register the service in addon engine config (engine project only)

For engine project, the service need to be added in `dependencies.services`. The following code will show an example
in publishr-admin-web.

```javascript
const PublishrAdminWebEngine = Engine.extend({
  modulePrefix,
  Resolver,

  dependencies: {
    services: [...otherServices, 'events-service']
  }
});
```

### Update the dummy app

In `tests/dummy/app/app.js` for engine or `app/app.js` for regular project, add events-service to `COMMON_SERVICES` list. 
After that, you are able to use it in the project. The websocket connection can be set up in `tests/dummy/app/routes/application.js` 
with the following code.

```javascript
import config from 'dummy/config/environment';

export default class extends Route {
  @service('events-service') events;

  beforeModel() {
    [...]
    this.events.establishConnection(config.eventsServerURL);
  }
}
```

Now the connection can be established, don't forget to configure the `eventsServerURL` value. To do that, go in
`tests/dummy/config/environment.js` and add eventsServerURL `process.env.EVENTS_SERVER_URL || 'wss://events-staging.upfluence.co/ws'`
in `ENV` definition.

## Use the service

To use the events service, there are 3 step to follow:

1. Declare the eventsService as ember service
```typescript
import EventsService from '@upfluence/hyperevents/services/events-service';

export default class {
  @service declare eventsService: EventsService;
}
```

2. Watch on the correct resource. This step permit to look up on the correct "channel" to get the data send by the backend.

```typescript
let myEvent = this.eventsService.watch(prefixPath('/resource-name'))
```

3. Subscribe to the event previously created with the eventsService watch method

```typescript
myEvent.subscribe((r: RequestEvent) => {
  //data processing
})
```

Congratulation, you are able to process data send by the events-service 🎉

## Test the service

The help for the tests, a mock service for the events-service is available. This is an example of usage

```typescript
import EventsServiceMock from '@upfluence/hyperevents/test-support/services/events-service';

test('test', function(){
  this.owner.register('service:events-service', EventsServiceMock); // register the mock service
  this.eventsService = this.owner.lookup('service:events-service');
  this.eventsService.registerResource('your-resource'); // register the resource to automaticaly add it to the EventResource
  
  // call method which call events-service watch and subscribe method

  this.eventsService.dispatch( // method to send a eventResource for all subscribe observables
    this.eventsService.buildResourceEvent({ // method to build the EventResource with a payload
      type: 'foobar'
    })
  );
  
  // add assert method for expected behavior
})
```

NB: It is possible to send multiple EventResource with `bulkDispatch` method.
