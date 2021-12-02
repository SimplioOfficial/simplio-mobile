import { Injectable } from '@angular/core';
import { WalletType } from 'src/app/interface/data';
import { Explorer, ExplorerType } from 'src/app/interface/explorer';
import { BalblockbookService } from './balblockbook.service';
import { BalinsightService } from './balinsight.service';

@Injectable({
  providedIn: 'root',
})
export class BalcoinService {
  constructor(private balinsight: BalinsightService, private balblockbook: BalblockbookService) {}

  getBalance(data: {
    addresses: string[];
    explorers: Explorer[];
    ticker: string;
    type: WalletType;
  }): Promise<number> {
    if (!data.explorers.length) return Promise.reject(new Error('No explorer found'));
    switch (data.explorers[0].type) {
      case ExplorerType.INSIGHT:
        return this.balinsight.getBalance(data);
      case ExplorerType.BLOCKBOOK:
      default:
        return this.balblockbook.getBalance(data);
    }
  }
}
