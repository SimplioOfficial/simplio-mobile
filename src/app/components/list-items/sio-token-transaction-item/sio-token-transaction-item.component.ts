import { Component, Input, OnInit } from '@angular/core';
import { NotificationType } from 'src/app/components/list-items/sio-wallet-item/sio-wallet-item.component';
import { Transaction, TxType, Wallet, WalletType } from 'src/app/interface/data';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'sio-token-transaction-item',
  templateUrl: './sio-token-transaction-item.component.html',
  styleUrls: ['./sio-token-transaction-item.component.scss'],
})
export class SioTokenTransactionItemComponent {
  readonly NOTIFICATION_TYPES = NotificationType;

  private tokens = [WalletType.SOLANA, WalletType.POLKADOT, WalletType.ETH];

  @Input() transaction: Transaction;
  @Input() wallet: Wallet;
  @Input() locale: string;
  @Input('unconfirmed-message') unconfirmedMsg = '';

  cls = {
    [TxType.SEND]: 'is-send',
    [TxType.RECEIVE]: 'is-receive',
    [TxType.MOVE]: 'is-move',
    [TxType.UNKNOWN]: 'is-unknown',
  };

  get statusClass(): string {
    return `${this.cls[this.transaction.type]}`;
  }

  get showHash(): boolean {
    return UtilsService.isSolana(this.wallet.type) || UtilsService.isPolkadot(this.wallet.type);
  }

  getNotificationType(tx: Transaction): NotificationType {
    return tx.confirmed ? NotificationType.NONE : NotificationType.UNCONFIRMED;
  }
}
