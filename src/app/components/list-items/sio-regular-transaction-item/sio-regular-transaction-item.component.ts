import { Component, Input, OnInit } from '@angular/core';
import { NotificationType } from 'src/app/components/list-items/sio-wallet-item/sio-wallet-item.component';
import { Transaction, TxType, WalletType } from 'src/app/interface/data';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'sio-regular-transaction-item',
  templateUrl: './sio-regular-transaction-item.component.html',
  styleUrls: ['./sio-regular-transaction-item.component.scss', '../generic-item.scss'],
})
export class SioRegularTransactionItemComponent implements OnInit {
  readonly NOTIFICATION_TYPES = NotificationType;

  private tokens = [WalletType.SOLANA, WalletType.POLKADOT, WalletType.ETH];

  @Input() transaction: Transaction;
  @Input() walletType: WalletType;
  @Input() walletTicker: string;
  @Input() walletDecimal: number;
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

  get isErcToken(): boolean {
    return this.tokens.includes(this.walletType);
  }

  get showHash(): boolean {
    return UtilsService.isSolana(this.walletType) || UtilsService.isPolkadot(this.walletType);
  }

  ngOnInit(): void {}

  getNotificationType(tx: Transaction): NotificationType {
    return tx.confirmed ? NotificationType.NONE : NotificationType.UNCONFIRMED;
  }
}
