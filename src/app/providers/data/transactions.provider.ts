import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';

import { TransactionDataResponse } from 'src/app/services/transactions.service';

@Injectable()
export class TransactionsProvider {
  private transactions = new BehaviorSubject<TransactionDataResponse>(null);
  transactions$ = this.transactions.pipe(filter(tx => !!tx));

  pushTransactions(txs: TransactionDataResponse) {
    this.transactions.next(txs);
  }
}
