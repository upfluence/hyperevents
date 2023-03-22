import Service, { inject as service } from '@ember/service';
import Configuration from '@upfluence/hyperevents/configuration';

export type ActivityType = 'page_view' | 'button_click';
export type Activity = {
  type: ActivityType;
  path: string;
  route: string;
  engine: string;
  version: string;
  extra: {};
};

export default class ActivityTracking extends Service {
  @service declare session: any;

  log(activity: Activity): Promise<void> {
    return this.fakeBulk([activity]);
  }

  logMultiple(activities: Activity[]): Promise<void> {
    return this.fakeBulk(activities);
  }

  private fakeBulk(activities: Activity[]): Promise<void> {
    console.log('logging ' + activities);
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
