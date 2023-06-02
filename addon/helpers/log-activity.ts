import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';
import { assert } from '@ember/debug';
import ActivityTracking from '../services/activity-tracking';

export default class extends Helper {
  @service declare activityTracking: ActivityTracking;

  compute(params: any[]) {
    const [action, actionDescription] = params;
    assert(
      '[helper][log-activity] An action is required for this helper to work properly.',
      typeof action === 'function'
    );
    assert(
      '[helper][log-activity] An actionDescription needs to be passed for the activity-log to make sense.',
      typeof actionDescription === 'string'
    );

    return (event: PointerEvent) => {
      this.activityTracking.log('button_click', actionDescription);
      return action(event);
    };
  }
}
