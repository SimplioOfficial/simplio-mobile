import { Injectable } from '@angular/core';
import { IStorage, KeyAlreadyExistsError } from './istorage';
import { Storage } from '@capacitor/storage';

@Injectable()
export class LocalStorage implements IStorage {
  constructor() {}

  async get(k: string): Promise<any> {
    return Storage.get({ key: k.replace('CapacitorStorage.', '') }).then(item => {
      const value = item.value;
      return typeof value === 'string' ? JSON.parse(value) : value;
    });
  }

  async set(k: string, v): Promise<void> {
    const setValue = typeof v === 'object' ? JSON.stringify(v) : v;
    return Storage.set({ key: k, value: setValue });
  }

  remove(key: string): Promise<void> {
    return Storage.remove({ key });
  }

  create(k: string, v): Promise<void> {
    return this.get(k).then(data => {
      if (data) {
        throw new KeyAlreadyExistsError();
      }
      this.set(k, v);
    });
  }
}
