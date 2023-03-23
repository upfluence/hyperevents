import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';
import { assert } from '@ember/debug';
import ActivityTracking, { Activity } from '../services/activity-tracking';

export default class extends Helper {
  @service declare activityTracking: ActivityTracking;

  compute(params: any[]) {
    const [action, actionDescription] = params;
    assert(
      '[helper][log-activity] An action is required for this helper to work properly.',
      typeof action === 'function'
    );

    return () => {
      const activity = this.buildActivityObject(actionDescription);
      this.activityTracking.log(activity);
      return action();
    };
  }

  private buildActivityObject(actionDescription: string): Activity {
    return {
      type: 'button_click',
      route: window.location.origin,
      path: window.location.pathname,
      action: actionDescription
    } as Activity;
  }
}

// transitions are page_views

// #2
// component_view
// decorator class that overloads the ctor

// #1
// modifier track-on-insertion
