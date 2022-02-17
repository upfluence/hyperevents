import Service from '@ember/service';

export default class Session extends Service.extend({
  // anything which *must* be merged to prototype here
}) {
  private _token: string | null = null;

  get data() {
    return {
      authenticated: {
        access_token: this._token
      }
    };
  }

  setAccessToken(token: string) {
    this._token = token;
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'session': Session;
  }
}
