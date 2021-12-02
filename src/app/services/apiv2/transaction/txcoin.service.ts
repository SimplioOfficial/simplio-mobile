import { Injectable } from '@angular/core';
import { assert } from 'console';
import { AddrUtxo } from 'src/app/interface/data';
import { Explorer, ExplorerType } from 'src/app/interface/explorer';
import { TransactionData, TransactionDataResponse } from '../../transactions.service';
import { TxblockbookService } from './txblockbook.service';
import { TxinsightService } from './txinsight.service';

@Injectable({
  providedIn: 'root',
})
export class TxcoinService {
  constructor(private txblockbook: TxblockbookService, private txinsight: TxinsightService) {}

  getTxs(data: {
    walletUnit: TransactionData;
    explorers: Explorer[];
  }): Promise<TransactionDataResponse> {
    if (data.explorers.length === 0) return Promise.reject(new Error('No explorer found gettxs'));
    switch (data.explorers[0].type) {
      case ExplorerType.INSIGHT:
        return this.txinsight.getTxs(data);
      case ExplorerType.BLOCKBOOK:
      default:
        return this.txblockbook.getTxs(data);
    }
  }

  getUtxo(data: { explorers: Explorer[]; addresses: string[] }): Promise<any> {
    if (data.explorers.length === 0) return Promise.reject(new Error('No explorer found getutxo'));
    switch (data.explorers[0].type) {
      case ExplorerType.INSIGHT:
        return this.txinsight.getUtxo(data);
      case ExplorerType.BLOCKBOOK:
      default:
        return this.txblockbook.getUtxo(data);
    }
  }
}
