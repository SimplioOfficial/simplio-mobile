import {
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';

import { Subscription } from 'rxjs';
import { Wallet, WalletType } from 'src/app/interface/data';
import { platform } from '@simplio/backend/utils';

import { coinNames } from '@simplio/backend/api/utils/coins';
export enum NotificationType {
  NONE,
  UNCONFIRMED,
  CONFIRMED,
}

@Component({
  selector: 'sio-wallet-item',
  templateUrl: './sio-wallet-item.component.html',
  styleUrls: ['./sio-wallet-item.component.scss', '../generic-item.scss'],
})
export class SioWalletItemComponent implements OnChanges {
  @Input() wallet: Wallet;
  @Input() fiatValue: number;
  @Input() currency = 'usd';
  @Input() locale = 'en';
  @Input() isContent: boolean;
  @Input() errCode = '';
  @Input('no-padding') @HostBinding('class.no-padding') noPadding = false;
  @Input('has-ripple') @HostBinding('class.ion-activatable') hasRipple = false;
  @Input('notification-type') notificationType = NotificationType.NONE;
  @Input('thumbnail-scale') thumbScale = 'normal';
  @Output() pressed = new EventEmitter();
  @Output() pressedUp = new EventEmitter();

  rateSubscription: Subscription;
  rate: any;
  tokenId: string;

  readonly NOTIFICATION_TYPES = NotificationType;

  constructor() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.wallet) {
      const wallet = changes.wallet.currentValue;
      this.notificationType =
        this.wallet.unconfirmed !== 0 ? NotificationType.UNCONFIRMED : NotificationType.NONE;
      this.tokenId = this.isToken() ? this.getTokenId() : '';
      this.updateWallet(wallet);
    }
  }

  press(e) {
    this.pressed.emit(e);
  }

  pressUp(e) {
    this.pressedUp.emit(e);
  }

  updateWallet(wallet: Wallet) {
    this.wallet = wallet;
  }

  get hasError(): boolean {
    return this.errCode !== '';
  }

  get origin(): string {
    return this.wallet.origin;
  }

  get platform(): string {
    return platform(this.wallet.type, this.wallet.ticker);
  }

  isToken(): boolean {
    return (
      this.wallet.type === WalletType.SOLANA_TOKEN ||
      this.wallet.type === WalletType.SOLANA_TOKEN_DEV ||
      this.wallet.type === WalletType.SAFE_TOKEN ||
      this.wallet.type === WalletType.BSC_TOKEN ||
      this.wallet.type === WalletType.ETH_TOKEN ||
      this.wallet.type === WalletType.CUSTOM_TOKEN
    );
  }

  private getTokenId(): string {
    switch (this.wallet.type) {
      case WalletType.BSC_TOKEN:
        return coinNames.BSC;
      case WalletType.ETH_TOKEN:
        return coinNames.ETH;
      case WalletType.SOLANA_TOKEN:
      case WalletType.SOLANA_TOKEN_DEV:
        return coinNames.SOL;
      case WalletType.SAFE_TOKEN:
        return coinNames.SAFE;
      case WalletType.CUSTOM_TOKEN:
      default:
        return '';
    }
  }
}
