import { isBoolean, sumBy, filter as _filter, isObject, sortBy } from 'lodash';
import { TransactionDataResponse } from '../../transactions.service';
export abstract class TxBase {
  name: string;
  constructor(name: string) {
    this.name = name;
    this.init();
  }

  sum(items, isMine) {
    const filters = { isMine: undefined };
    if (isBoolean(isMine)) filters.isMine = isMine;
    return sumBy(_filter(items, filters), item => parseFloat(item.amount));
  }

  sumVout(items, isMine) {
    const filters = { isMine: undefined };
    if (isBoolean(isMine)) filters.isMine = isMine;
    return sumBy(_filter(items, filters), item => parseFloat(item.amount));
  }

  abstract init(): void;
  abstract getTxs(data: any): Promise<TransactionDataResponse>;
  abstract parseTxs(data: any): any;
}
