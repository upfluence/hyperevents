import { ActivityType } from '../services/activity-tracking';
import { assert } from '@ember/debug';
import { getOwner } from '@ember/application';

interface Constructable {
  new (...args: any[]): any;
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
        getOwner(this)
          .lookup('service:activity-tracking')
          .log(actionType ?? 'page_view', actionDescription);
      }
    };
  };
}
