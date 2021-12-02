import { Injectable } from '@angular/core';
import { IStorage, KeyAlreadyExistsError } from './istorage';
import { Storage } from '@capacitor/storage';

@Injectable()
export class FileStorage implements IStorage {
  constructor() {}

  async get(k: string): Promise<any> {
    return Storage.get({ key: k.replace('CapacitorStorage.', '') }).then(item => {
      const value = item.value;
      console.log('value', value);
      return typeof value === 'string' ? JSON.parse(value) : value;
    });
  }

  async set(k: string, v): Promise<void> {
    const setValue = typeof v === 'object' ? JSON.stringify(v) : v;
    console.log('setValue', setValue);
    return Storage.set({ key: k, value: setValue });
  }

  async remove(k: string): Promise<void> {
    await Storage.remove({
      key: k.includes('CapacitorStorage.') ? k : k + 'CapacitorStorage.',
    });
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
