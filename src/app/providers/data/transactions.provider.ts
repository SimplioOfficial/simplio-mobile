import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';

import { TransactionDataResponse } from 'src/app/services/transactions.service';
import { Transaction } from '../../interface/data';

@Injectable()
export class TransactionsProvider {
  private transactions = new BehaviorSubject<TransactionDataResponse>(null);
  transactions$ = this.transactions.pipe(filter(tx => !!tx));

  get transactionsValue(): Transaction[] {
    return this.transactions.value.data;
  }

  pushTransactions(txs: TransactionDataResponse) {
    this.transactions.next(txs);
  }
}
