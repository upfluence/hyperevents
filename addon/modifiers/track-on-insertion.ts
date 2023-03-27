import Modifier from 'ember-modifier';
import { inject as service } from '@ember/service';
import { assert } from '@ember/debug';
import ActivityTracking, { Activity } from '../services/activity-tracking';

interface TrackOnInsertionModifierArgs {
  positional: [string];
  named: {
    relative: boolean;
  };
}

export default class TrackOnInsertionModifier extends Modifier<TrackOnInsertionModifierArgs> {
  @service declare activityTracking: ActivityTracking;

  get description(): string {
    return this.args.positional[0];
  }

  didReceiveArguments(): void {
    assert(
      '[modifier][track-on-insertion] An actionDescription needs to be passed for the activity-log to make sense.',
      typeof this.description === 'string'
    );
    const activity: Activity = this.buildActivityObject();
    this.activityTracking.log(activity);
  }

  private buildActivityObject(): Activity {
    return {
      type: 'component_view',
      route: window.location.origin,
      path: window.location.pathname,
      action: this.description
    };
  }
}
