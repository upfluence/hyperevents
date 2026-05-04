import Helper from '@ember/component/helper';
import { assert } from '@ember/debug';
import { run } from '@ember/runloop';
import { inject as service } from '@ember/service';

import ActivityTracking from '../services/activity-tracking';

export default class extends Helper {
  @service declare activityTracking: ActivityTracking;

  compute(params: any[]) {
    const [action, actionDescription] = params;
    run(() => {
      assert(
        '[helper][log-activity] An action is required for this helper to work properly.',
        typeof action === 'function'
      );
      assert(
        '[helper][log-activity] An actionDescription needs to be passed for the activity-log to make sense.',
        typeof actionDescription === 'string'
      );
    });

    return (event: PointerEvent) => {
      this.activityTracking.log('button_click', actionDescription);
      return action(event);
    };
  }
}
