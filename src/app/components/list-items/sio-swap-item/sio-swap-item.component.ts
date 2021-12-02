import { Component, HostBinding, Input } from '@angular/core';
import { ThemeMode } from 'src/app/interface/settings';
import { SwapReportItem, SwapStatusText, SwapStatusTranslations } from 'src/app/interface/swap';
import { AddressPipe } from 'src/app/pipes/address.pipe';

@Component({
  selector: 'sio-swap-item',
  templateUrl: './sio-swap-item.component.html',
  styleUrls: ['../generic-item.scss', './sio-swap-item.component.scss'],
})
export class SioSwapItemComponent {
  @Input() transaction: SwapReportItem;
  @Input() translations: SwapStatusTranslations;
  @Input() currency = 'usd';
  @Input() mode: ThemeMode = ThemeMode.light;
  @Input() locale = 'en';
  @Input('address-names') addressNames: Map<string, string> = new Map();

  @HostBinding('attr.data-transaction-type') get transactionType() {
    return this.transaction.Status;
  }
  get statusClass(): string {
    return `is-${this.transaction.Status.toLowerCase()}`;
  }

  get isCompleted(): boolean {
    return this.transaction.Status === SwapStatusText.Completed;
  }

  private _getAddress(a: string): string {
    return AddressPipe.prototype.transform(a, 3);
  }

  get status(): string {
    if (!this.transaction && !this.translations) return '';
    return this.translations[this.transaction.Status];
  }

  get balance(): number {
    return this.isCompleted
      ? this.transaction.TargetWithdrawalAmount
      : this.transaction.UserAgreedAmount;
  }

  getWalletName(address: string, ticker: string): string {
    const key = [address, ticker].join('_');
    return this.addressNames.get(key) || this._getAddress(address);
  }
}
