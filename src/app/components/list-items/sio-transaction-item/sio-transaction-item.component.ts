import { Component, Input, OnInit } from '@angular/core';
import { NotificationType } from 'src/app/components/list-items/sio-wallet-item/sio-wallet-item.component';
import { Transaction, TxType, Wallet, WalletType } from 'src/app/interface/data';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'sio-transaction-item',
  templateUrl: './sio-transaction-item.component.html',
  styleUrls: ['./sio-transaction-item.component.scss', '../generic-item.scss'],
})
export class SioTransactionItemComponent implements OnInit {
  readonly NOTIFICATION_TYPES = NotificationType;

  @Input() transaction: Transaction;
  @Input() wallet: Wallet;
  @Input() txTokenType: WalletType;
  @Input() locale: string;
  @Input('unconfirmed-message') unconfirmedMsg = '';

  cls = {
    [TxType.SEND]: 'is-send',
    [TxType.RECEIVE]: 'is-receive',
    [TxType.MOVE]: 'is-move',
    [TxType.TOKEN]: 'is-token',
    [TxType.UNKNOWN]: 'is-unknown',
  };

  get statusClass(): string {
    return this.txTokenType === this.wallet.type
      ? `${this.cls[this.transaction.type]}`
      : `${this.cls[TxType.TOKEN]}`;
  }

  get showHash(): boolean {
    return UtilsService.isPolkadot(this.wallet.type) || this.transaction.address === undefined;
  }

  ngOnInit(): void {}

  getNotificationType(tx: Transaction): NotificationType {
    return tx.confirmed ? NotificationType.NONE : NotificationType.UNCONFIRMED;
  }
}
