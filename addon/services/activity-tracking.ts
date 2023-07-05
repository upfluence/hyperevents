import { debounce } from '@ember/runloop';
import Service, { inject as service } from '@ember/service';
import { getOwnConfig } from '@embroider/macros';
import { getOwner } from '@ember/application';
import { tracked } from '@glimmer/tracking';

import Configuration from '@upfluence/hyperevents/configuration';

export type ActivityType = 'page_view' | 'button_click' | 'component_view';
export type Activity = {
  type: ActivityType;
  action: string;
  path: string;
  route: string;
  origin?: string;
  version?: string;
  extra?: {};
};

const RETRY_ATTEMPTS: number = 1;
const THROTTLE_TIME_MS = 1000;

export default class ActivityTracking extends Service {
  @service declare session: any;
  @tracked activityQueue: Activity[] = [];

  log(type: ActivityType, action: string): void {
    this.activityQueue.push(this.buildActivityObject(type, action));
    debounce(this, this.performCall, THROTTLE_TIME_MS);
  }

  private performCall(tries: number = RETRY_ATTEMPTS, retryActivityQueue?: Activity[]): void {
    if (this.activityQueue.length === 0 && !retryActivityQueue) return;
    const tempActivityQueue: Activity[] = retryActivityQueue ?? [...this.activityQueue];
    this.activityQueue = [];
    this.sendBulkActivities(tempActivityQueue).catch(() => {
      if (tries > 0) this.performCall(--tries, tempActivityQueue);
    });
  }

  private sendBulkActivities(activities: Activity[]): Promise<void> {
    return fetch(this.apiUrl, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        environment: (getOwnConfig() as any).buildEnv,
        activities: activities
      })
    }).then((response: Response) => {
      if (!response.ok) {
        return response.json().then((e) => Promise.reject(e));
      }
      return Promise.resolve();
    });
  }

  private get apiUrl(): string {
    return `${Configuration.backendActivityUrl}/activity/bulk`;
  }

  private get headers(): Headers {
    return new Headers({ Authorization: `Bearer ${this.accessToken}` });
  }

  private get accessToken(): string {
    return this.session.data.authenticated.access_token;
  }

  private buildActivityObject(type: ActivityType, action: string): Activity {
    return {
      type: type,
      origin: window.location.origin,
      route: getOwner(this).lookup('service:router').currentRouteName,
      path: window.location.pathname,
      action: action,
      version: (getOwnConfig() as any).parentAppVersion || 'unknown'
    };
  }
}

declare module '@ember/service' {
  interface Registry {
    'activity-tracking': ActivityTracking;
  }
}
