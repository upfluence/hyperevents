import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';
import { assert } from '@ember/debug';
import { getOwner } from '@ember/application';
import ActivityTracking, { Activity } from '../services/activity-tracking';
import { getOwnConfig } from '@embroider/macros';

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
      const activity = this.buildActivityObject(actionDescription);
      this.activityTracking.log(activity);
      return action(event);
    };
  }

  private buildActivityObject(actionDescription: string): Activity {
    return {
      type: 'button_click',
      origin: window.location.origin,
      route: getOwner(this).lookup('service:router').currentRouteName,
      path: window.location.pathname,
      action: actionDescription,
      version: (getOwnConfig() as any).parentAppVersion || 'unknown'
    };
  }
}
