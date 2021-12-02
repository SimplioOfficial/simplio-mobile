import { Injectable } from '@angular/core';

import { isObject, isString } from 'lodash';

import { IStorage, KeyAlreadyExistsError } from './istorage';

// @todo remove this file if it's not used
@Injectable()
export class SqlStorage implements IStorage {
  ls;

  constructor() {}

  create(k: string, v): Promise<void> {
    return this.get(k).then(data => {
      if (data) {
        throw new KeyAlreadyExistsError();
      }
      this.set(k, v);
    });
  }

  get(k: string): Promise<any> {
    return new Promise(resolve => {
      const v = this.ls.getItem(k);
      return resolve(this.processValue(v));
    });
  }

  processValue(v) {
    if (!v) {
      return null;
    }
    if (!isString(v)) {
      return v;
    }
    let parsed;
    try {
      parsed = JSON.parse(v);
    } catch (e) {
      // TODO parse is not necessary
    }
    return parsed || v;
  }

  remove(k: string): Promise<void> {
    return new Promise<void>(resolve => {
      this.ls.removeItem(k);
      // this.logger.debug(`Storage Key: ${k} removed`);
      resolve();
    });
  }

  set(k: string, v): Promise<void> {
    return new Promise<void>(resolve => {
      if (isObject(v)) {
        v = JSON.stringify(v);
      }
      if (!isString(v)) {
        v = v.toString();
      }
      this.ls.setItem(k, v);
      resolve();
    });
  }
}
