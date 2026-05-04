import { Observable } from './observable';

export class ObserverGroup<T> {
  private _observables: Observable<T>[] = [];

  subscribe(observable: Observable<T>): void {
    this._observables.push(observable);
  }

  unsubscribe(observable: Observable<T>): void {
    this._observables = this._observables.filter((o) => o !== observable);
  }

  dispatch(event: T): void {
    this._observables.forEach((watcher) => {
      watcher.dispatch(event);
    });
  }
}
