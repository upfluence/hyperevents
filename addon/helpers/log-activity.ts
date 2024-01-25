import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';

import ActivityTracking from '../services/activity-tracking';

export default class extends Helper {
  @service declare activityTracking: ActivityTracking;

  compute(params: any[]) {
    const [action, actionDescription] = params;

    return (event: PointerEvent) => {
      this.activityTracking.log('button_click', actionDescription);
      return action(event);
    };
  }
}
