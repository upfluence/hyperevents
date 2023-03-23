import Service, { inject as service } from '@ember/service';
import Configuration from '@upfluence/hyperevents/configuration';

export type ActivityType = 'page_view' | 'button_click';
export type Activity = {
  type: ActivityType;
  action?: string;
  path: string;
  route: string;
  engine: string;
  version: string;
  extra: {};
};

export default class ActivityTracking extends Service {
  @service declare session: any;

  log(activity: Activity): void {
    this.fakeBulk([activity])
      .then(() => {
        console.log('activity logged');
        console.log(activity);
      })
      .catch(() => {
        // retry once;
      });
  }

  logMultiple(activities: Activity[]): void {
    this.fakeBulk(activities)
      .then(() => {
        console.log('activities logged');
        console.log(activities);
      })
      .catch(() => {
        // retry once;
      });
  }

  private fakeBulk(activities: Activity[]): Promise<void> {
    activities;
    return Promise.resolve();
  }

  // @ts-ignore
  private bulk(activities: Activity[]): Promise<void> {
    return fetch(this.ApiUrl, {
      method: 'PUT',
      headers: this.headers,
      body: JSON.stringify(activities)
    }).then((response: Response) => {
      if (!response.ok) {
        return response.json().then((e) => Promise.reject(e));
      }
      return response.json();
    });
  }
  // retry once on failure ?

  private get ApiUrl(): string {
    return `${Configuration.backendActivityUrl}api/v1/activity/bulk`;
  }

  private get headers(): Headers {
    return new Headers({ Authorization: `Bearer ${this.accessToken}` });
  }

  private get accessToken(): string {
    return this.session.data.authenticated.access_token;
  }
}

declare module '@ember/service' {
  interface Registry {
    'activity-tracking': ActivityTracking;
  }
}
