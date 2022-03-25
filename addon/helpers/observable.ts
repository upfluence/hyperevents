import { ObserverGroup } from './observer-group';

export type Matcher<T> = (event: T) => boolean;
export type Callback<T> = (event: T) => void;

export class Observable<T> {
  private _callback: Callback<T> | null = null;
  private _matcher: Matcher<T> | null;
  private _group: ObserverGroup<T>;

  constructor(group: ObserverGroup<T>, matcher: Matcher<T> | null = null) {
    this._matcher = matcher;
    this._group = group;
    group.subscribe(this);
  }

  subscribe(callback: Callback<T>): void {
    this._callback = callback;
  }

  unsubscribe(): void {
    this._group.unsubscribe(this);
  }

  dispatch(event: T): void {
    if (this._callback && (this._matcher?.(event) ?? true)) {
      this._callback(event);
    }
  }
}
