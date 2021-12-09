import { Component, Input, OnInit } from '@angular/core';
import { NotificationType } from 'src/app/components/list-items/sio-wallet-item/sio-wallet-item.component';
import { Transaction, TxType, Wallet, WalletType } from 'src/app/interface/data';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'sio-purchase-item',
  templateUrl: './sio-purchase-item.component.html',
  styleUrls: ['./sio-purchase-item.component.scss', '../generic-item.scss']
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
    [TxType.UNKNOWN]: 'is-unknown'
  };

  get statusClass(): string {
    return ""
    // return this.txTokenType === this.walletType ? `${this.cls[this.transaction.type]}` : `${this.cls[TxType.TOKEN]}`;
    // return this.txTokenType === this.wallet.type ? `${this.cls[this.transaction.type]}` : `${this.cls[TxType.TOKEN]}`;
  }

  get showHash(): boolean {
    return true
    // return UtilsService.isPolkadot(this.wallet.type) || this.transaction.address === undefined;
  }

  ngOnInit(): void {}

  getNotificationType(tx: Transaction): NotificationType {
    return tx.confirmed ? NotificationType.NONE : NotificationType.UNCONFIRMED;
  }
}
