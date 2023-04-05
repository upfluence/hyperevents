import Service, { inject as service } from '@ember/service';
import Configuration from '@upfluence/hyperevents/configuration';

export type ActivityType = 'page_view' | 'button_click' | 'component_view';
export type Activity = {
  type: ActivityType;
  action?: string;
  path: string;
  route: string; // currentRoute formatted by Ember's Router
  origin?: string; // should we add this to easily differentiate between the software, creators & wednesday apps ?
  version?: string;
  extra?: {};
};

// find a way to get version of the parent project

// find a way to get the route /facade/:id/xxx/lists for instance
// router.currentPath
// in path, put window.location

// batch activities

// define a norm for extra params
// [action]-[type]-[name]
// e.g. open-modal-product

// sync w/ Karim for endpoint & ActivityTypes
// removing engine because its not that useful
// added 'component_view' in ActivityTypes

const RETRY_ATTEMPTS: number = 1;

export default class ActivityTracking extends Service {
  @service declare session: any;

  log(activity: Activity): void {
    // this method could also batch all the activities during XX seconds
    // and then make the call to the BE
    // Downside of doing this is that we might lose information if the user closes the page/app
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
      method: 'POST',
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
