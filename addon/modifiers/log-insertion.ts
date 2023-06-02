import Modifier from 'ember-modifier';
import { inject as service } from '@ember/service';
import { assert } from '@ember/debug';
import ActivityTracking from '../services/activity-tracking';

interface LogInsertionModifierArgs {
  positional: [string];
  named: {
    relative: boolean;
  };
}

export default class LogInsertionModifier extends Modifier<LogInsertionModifierArgs> {
  @service declare activityTracking: ActivityTracking;

  get description(): string {
    return this.args.positional[0];
  }

  didInstall(): void {
    assert(
      '[modifier][log-insertion] An actionDescription needs to be passed for the activity-log to make sense.',
      typeof this.description === 'string'
    );
    this.activityTracking.log('component_view', this.description);
  }
}
