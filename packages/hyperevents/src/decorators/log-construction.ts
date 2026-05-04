import { getOwner } from '@ember/application';
import { assert } from '@ember/debug';

import type { ActivityType } from '../services/activity-tracking';

interface Constructable {
  new (...args: any[]): any;
}

function getActivityTrackingService(instance: object) {
  let owner = getOwner(instance) ?? (globalThis as any).Ember?.getOwner?.(instance);

  return owner.lookup('service:activity-tracking');
}

export function logConstruction(actionDescription: string, actionType: ActivityType) {
  return function extendClass<T extends Constructable>(BaseClass: T) {
    return class extends BaseClass {
      constructor(...args: any) {
        super(...args);
        assert(
          '[decorator][log-construction] An actionDescription needs to be passed for the activity-log to make sense.',
          typeof actionDescription === 'string'
        );
        getActivityTrackingService(this).log(actionType ?? 'page_view', actionDescription);
      }
    };
  };
}
