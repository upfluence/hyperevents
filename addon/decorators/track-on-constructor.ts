import { ActivityType } from '../services/activity-tracking';
import { assert } from '@ember/debug';
import { getOwner } from '@ember/application';
import { getOwnConfig } from '@embroider/macros';

interface Constructable {
  new (...args: any[]): any;
}

export function trackOnConstructor(actionDescription: string, actionType: ActivityType) {
  return function extendClass<T extends Constructable>(BaseClass: T) {
    return class extends BaseClass {
      constructor(...args: any) {
        super(...args);
        assert(
          '[decorator][track-on-constructor] An actionDescription needs to be passed for the activity-log to make sense.',
          typeof actionDescription === 'string'
        );
        getOwner(this)
          .lookup('service:activity-tracking')
          .log({
            type: actionType ?? 'page_view',
            origin: window.location.origin,
            route: getOwner(this).lookup('service:router').currentRouteName,
            path: window.location.pathname,
            action: actionDescription,
            version: (getOwnConfig() as any).parentAppVersion || 'unknown'
          });
      }
    };
  };
}
