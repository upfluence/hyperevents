import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { Observable } from 'hyperevents/helpers/observable';
import EventsService, { prefixPath, ResourceEvent } from 'hyperevents/services/events-service';

interface SubscriptionFeedArgs {
  url: string;
  removeObs(url: string): void;
}

export default class SubscriptionFeed extends Component<SubscriptionFeedArgs> {
  @service declare eventsService: EventsService;
  @tracked data: any[] = [];
  @tracked listeningState: 'Listening' | 'Not Listening' = 'Not Listening';

  _dataObs: Observable<ResourceEvent> | null = null;

  constructor(owner: unknown, args: SubscriptionFeedArgs) {
    super(owner, args);
    this._initObserver();
  }

  @action
  unsubscribe(): void {
    this._dataObs?.unsubscribe();
    this.listeningState = 'Not Listening';
  }

  @action
  subscribe(): void {
    this._initObserver();
  }

  @action
  removeObs(): void {
    this.unsubscribe();
    this.args.removeObs(this.args.url);
  }

  private _initObserver(): void {
    this._dataObs = this.eventsService.watch(prefixPath(this.args.url));
    console.log('New Observer watching : ', this.args.url);
    this.listeningState = 'Listening';
    this._dataObs.subscribe((event: any) => {
      console.log('package received: ', JSON.stringify(event));
      this.data.push(JSON.stringify(event));
      this.data = this.data;
    });
  }
}
