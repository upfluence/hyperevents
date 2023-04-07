import Modifier from 'ember-modifier';
import { inject as service } from '@ember/service';
import { assert } from '@ember/debug';
import { getOwner } from '@ember/application';
import ActivityTracking, { Activity } from '../services/activity-tracking';
import { getOwnConfig } from '@embroider/macros';

interface TrackOnDeletionModifierArgs {
  positional: [string];
  named: {
    relative: boolean;
  };
}

export default class TrackOnDeletionModifier extends Modifier<TrackOnDeletionModifierArgs> {
  @service declare activityTracking: ActivityTracking;

  get description(): string {
    return this.args.positional[0];
  }

  willDestroy() {
    assert(
      '[modifier][track-on-deletion] An actionDescription needs to be passed for the activity-log to make sense.',
      typeof this.description === 'string'
    );
    const activity: Activity = this.buildActivityObject();
    this.activityTracking.log(activity);
  }

  private buildActivityObject(): Activity {
    return {
      type: 'component_view',
      origin: window.location.origin,
      route: getOwner(this).lookup('service:router').currentRouteName,
      path: window.location.pathname,
      action: this.description,
      version: (getOwnConfig() as any).parentAppVersion || 'unknown'
    };
  }
}
