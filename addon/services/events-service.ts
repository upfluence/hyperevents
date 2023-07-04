import { later } from '@ember/runloop';
import Service, { inject as service } from '@ember/service';
import { Matcher } from '@upfluence/hyperevents/helpers/observable';
import { Observable } from '@upfluence/hyperevents/helpers/observable';
import { ObserverGroup } from '@upfluence/hyperevents/helpers/observer-group';

const NORMAL_CLOSURE_CODE = 1000;
const USER_REQUESTED_CLOSURE = 'user-requested-closure';

export interface ResourceEvent {
  resource: string;
  payload: any;
}

export function prefixPath(prefix: string): Matcher<ResourceEvent> {
  return (event: ResourceEvent): boolean => {
    return event.resource.startsWith(prefix);
  };
}

export function exactPath(path: string): Matcher<ResourceEvent> {
  return (event: ResourceEvent): boolean => {
    return event.resource === path;
  };
}

export default class EventsService extends Service {
  @service declare session: any;

  private _socket: WebSocket | null = null;
  private _onConnectedObservers: ObserverGroup<void> = new ObserverGroup();
  private _onDisconnectedObservers: ObserverGroup<void> = new ObserverGroup();
  private _onMessageObservers: ObserverGroup<ResourceEvent> = new ObserverGroup();
  private _attempt: number = 0;
  private _url: string | null = null;
  private _connTimer: any | null;

  constructor() {
    super(...arguments);
  }

  /**
   * A method that returns an Observable that will emit events when a 'matching' message is received.
   *
   * @param {Matcher} matcher - A function that tells if a ResourceEvent should trigger the Observable.
   */
  watch(matcher: Matcher<ResourceEvent>): Observable<ResourceEvent> {
    return new Observable(this._onMessageObservers, matcher);
  }

  onConnected(): Observable<void> {
    return new Observable(this._onConnectedObservers);
  }

  onDisconnected(): Observable<void> {
    return new Observable(this._onDisconnectedObservers);
  }

  establishConnection(connectionUrl: string): void {
    this._url = connectionUrl;
    this._tryConnect();
  }

  terminateConnection(): void {
    this._socket?.close(NORMAL_CLOSURE_CODE, USER_REQUESTED_CLOSURE);
  }

  private _tryConnect(): void {
    if (this._connTimer) {
      console.info(`Canceling connection attempt connection already progress`);
      return;
    }

    const attempt = this._attempt;
    const delay = this._backoffDelay(attempt);
    this._attempt++;

    console.info(`Scheduling connection attempt n°${attempt} after a delay of ${delay / 1000}s`);

    this._connTimer = later(
      this,
      () => {
        try {
          console.info(`Attempting connection n°${attempt} after a delay of ${delay / 1000}s`);
          this._connect();
        } catch (e) {
          console.error(`Could not establish connection: ${e}`);
          this._connTimer = null;
          this._tryConnect();
        }
      },
      delay
    );
  }

  private _connect(): void {
    this._socket = this._buildSocket(`${this._url}?access_token=${this._accessToken}`);
    this._socket.addEventListener('message', this._handleMessage.bind(this));
    this._socket.addEventListener('error', this._handleError.bind(this));
    this._socket.addEventListener('close', this._handleClose.bind(this));
    this._socket.addEventListener('open', this._handleOpen.bind(this));
  }

  private _handleOpen(): void {
    this._onConnectedObservers.dispatch();
    this._attempt = 0;
    this._connTimer = null;
  }

  private _handleMessage(event: MessageEvent): void {
    this._onMessageObservers.dispatch(JSON.parse(event.data));
  }

  private _handleClose(event: CloseEvent): void {
    this._onDisconnectedObservers.dispatch();
    if (event.code !== NORMAL_CLOSURE_CODE && event.reason !== USER_REQUESTED_CLOSURE) {
      this._connTimer = null;
      this._tryConnect();
    }
  }

  private _handleError(): void {
    this._socket?.close();
  }

  private _backoffDelay(attempt: number): number {
    if (attempt === 0) {
      return 200;
    }
    return Math.min(Math.exp(attempt) * 1000 + this._jitterDelay, 60000);
  }

  private _buildSocket(url: string): WebSocket {
    return new WebSocket(url);
  }

  private get _jitterDelay(): number {
    return Math.floor(Math.random() * 5000);
  }

  private get _accessToken(): string {
    return encodeURIComponent(this.session.data.authenticated.access_token);
  }
}

declare module '@ember/service' {
  interface Registry {
    events: EventsService;
  }
}
