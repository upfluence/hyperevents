import Service from '@ember/service';

import { Observable, Matcher } from '@upfluence/hyperevents/helpers/observable';
import { ObserverGroup } from '@upfluence/hyperevents/helpers/observer-group';
import { ResourceEvent } from '@upfluence/hyperevents/services/events-service';

export default class EventsServiceMock extends Service {
  resource: string = '';
  _onMessageObservers: ObserverGroup<ResourceEvent> = new ObserverGroup();

  watch(matcher: Matcher<ResourceEvent>): Observable<ResourceEvent> {
    return new Observable(this._onMessageObservers, matcher);
  }

  dispatch(event: ResourceEvent) {
    this._onMessageObservers.dispatch(event);
  }

  bulkDispatch(events: ResourceEvent[]) {
    events.forEach((event) => {
      this._onMessageObservers.dispatch(event);
    });
  }

  registerResource(resource: string) {
    this.resource = resource;
  }

  buildResourceEvent(payload: object): ResourceEvent {
    return {
      resource: this.resource,
      payload: payload
    };
  }
}
