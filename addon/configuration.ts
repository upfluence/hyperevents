// @ts-nocheck
import { typeOf } from '@ember/utils';

const DEFAULTS = {
  backendActivityUrl: 'https://activity.upfluence.co',
  enableEngineSupport: false
};

export default {
  ...DEFAULTS,

  __initialized__: false,

  load(config) {
    for (let property in this) {
      // eslint-disable-next-line no-prototype-builtins
      if (this.hasOwnProperty(property) && typeOf(this[property]) !== 'function') {
        if (this[property].constructor == Object) {
          this[property] = Object.assign(this[property], config[property] ?? DEFAULTS[property]);
        } else {
          this[property] = config[property] ?? DEFAULTS[property];
        }
      }
    }

    this.__initialized__ = true;
  }
};
