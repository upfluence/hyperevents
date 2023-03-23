import Service, { inject as service } from '@ember/service';
import Configuration from '@upfluence/hyperevents/configuration';

export type ActivityType = 'page_view' | 'button_click' | 'component_view';
export type Activity = {
  type: ActivityType;
  action?: string;
  path: string;
  route: string;
  engine?: string;
  version?: string;
  extra?: {};
};

const RETRY_ATTEMPTS: number = 1;

export default class ActivityTracking extends Service {
  @service declare session: any;

  log(activity: Activity): void {
    this.performCall([activity]);
  }

  logMultiple(activities: Activity[]): void {
    this.performCall(activities);
  }

  private performCall(activities: Activity[], tries: number = RETRY_ATTEMPTS): void {
    this.sendBulkActivities(activities)
      .then(() => {
        console.log('Activities have been logged');
        console.log(activities);
      })
      .catch(() => {
        if (tries > 0) this.performCall(activities, --tries);
      });
  }

  private sendBulkActivities(activities: Activity[]): Promise<void> {
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
