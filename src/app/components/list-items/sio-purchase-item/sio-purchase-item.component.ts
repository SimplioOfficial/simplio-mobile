import { Component, Input, OnInit } from '@angular/core';
import { NotificationType } from 'src/app/components/list-items/sio-wallet-item/sio-wallet-item.component';
import { Transaction, TxType } from 'src/app/interface/data';

@Component({
  selector: 'sio-purchase-item',
  templateUrl: './sio-purchase-item.component.html',
  styleUrls: ['./sio-purchase-item.component.scss', '../generic-item.scss'],
})
export class SioPurchaseItemComponent implements OnInit {
  readonly NOTIFICATION_TYPES = NotificationType;

  @Input() transaction: Transaction;
  @Input('wallet-type') walletType = 0;
  @Input() balace = 0;

  // @Input() wallet: Wallet;
  // @Input() txTokenType: WalletType;
  @Input() locale: string;
  @Input('unconfirmed-message') unconfirmedMsg = '';

  readonly cls = {
    [TxType.SEND]: 'is-send',
    [TxType.RECEIVE]: 'is-receive',
    [TxType.MOVE]: 'is-move',
    [TxType.TOKEN]: 'is-token',
    [TxType.UNKNOWN]: 'is-unknown',
  };

  ngOnInit(): void {}

  getNotificationType(tx: Transaction): NotificationType {
    return tx.confirmed ? NotificationType.NONE : NotificationType.UNCONFIRMED;
  }
}
