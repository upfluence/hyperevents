import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import EventsService from '@upfluence/hyperevents/services/events-service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class ApplicationController extends Controller {
  @service declare eventsService: EventsService;
  @service declare session: any;

  @tracked token: string = '';
  @tracked wsUrl: string = 'wss://events-staging.upfluence.co/ws';
  @tracked newObserver: string = '';
  @tracked wsConnected: boolean = false;
  @tracked obsUrlArray: string[] = [];

  constructor() {
    super(...arguments);
  }

  @action
  initSocket(): void {
    if (!!this.token && !!this.wsUrl) {
      this.session.setAccessToken(this.token);
      this.eventsService.establishConnection(this.wsUrl);
      this.eventsService.onConnected().subscribe(() => {
        this.wsConnected = true;
        console.log('connected');
      });
    }
  }

  @action
  terminateSocket(): void {
    this.eventsService.terminateConnection();
  }

  @action
  handleNewObserverInput(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this._createObserver();
    }
  }

  @action
  createNewObserver(): void {
    this._createObserver();
  }

  @action
  removeObs(url: string): void {
    this.obsUrlArray = this.obsUrlArray.filter((obsUrl) => obsUrl !== url);
  }

  private _createObserver(): void {
    console.log('Creating new observer: ', this.newObserver);
    this.obsUrlArray.push(this.newObserver);
    this.obsUrlArray = this.obsUrlArray;
    this.newObserver = '';
  }
}
