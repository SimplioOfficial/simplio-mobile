import { Injectable } from '@angular/core';
import { BalBase } from './balancebase';

@Injectable({
  providedIn: 'root',
})
export class BalpolkadotService extends BalBase {
  constructor() {
    super('BalpolkadotService');
  }

  init() {}

  getBalance(data: { address: string }): Promise<number> {
    console.log('Implement this');
    return Promise.resolve(0);
  }
}
