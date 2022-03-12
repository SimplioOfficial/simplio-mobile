import { Component, Input } from '@angular/core';
import { TxType } from 'src/app/interface/data';

@Component({
  selector: 'sio-transaction-thumbnail',
  templateUrl: './sio-transaction-thumbnail.component.html',
  styleUrls: ['./sio-transaction-thumbnail.component.scss', '../generic-thumbnail.scss'],
})
export class SioTransactionThumbnailComponent {
  @Input('transaction-type') transactionType = TxType.UNKNOWN;

  get icon(): string {
    switch (this.transactionType) {
      case TxType.RECEIVE:
        return 'trending-up';
      case TxType.SEND:
        return 'trending-down';
      default:
        return 'help';
    }
  }
}
