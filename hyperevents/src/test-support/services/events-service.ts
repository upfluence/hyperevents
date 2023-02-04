import Service from '@ember/service';

import { ResourceEvent } from '@upfluence/hyperevents/services/events-service';
import { ObserverGroup } from '@upfluence/hyperevents/helpers/observer-group';
import { Observable, Matcher } from '@upfluence/hyperevents/helpers/observable';

export default class EventsServiceMock extends Service {
  _onMessageObservers: ObserverGroup<ResourceEvent> = new ObserverGroup();

  watch(matcher: Matcher<ResourceEvent>): Observable<ResourceEvent> {
    return new Observable(this._onMessageObservers, matcher);
  }

  dispatch(evt: ResourceEvent) {
    this._onMessageObservers.dispatch(evt);
  }
};
