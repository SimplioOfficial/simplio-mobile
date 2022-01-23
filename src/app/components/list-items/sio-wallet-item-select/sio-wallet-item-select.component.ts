import { Component, EventEmitter, Input, Output } from '@angular/core';

import { Wallet } from 'src/app/interface/data';

@Component({
  selector: 'sio-wallet-item-select',
  templateUrl: './sio-wallet-item-select.component.html',
  styleUrls: ['../generic-item.scss', './sio-wallet-item-select.component.scss'],
})
export class SioWalletItemSelectComponent {
  @Input() wallet: Wallet | null;
  @Input() label = '';
  @Input() fiatValue: number | string;
  @Input() rate: number;
  @Input() currency = 'usd';
  @Input() locale = 'en';
  @Input() isContent: boolean;
  @Input() errCode: string;
  @Input() routerLink?: Array<string> = [];
  @Input() title = 'Select wallet';
  @Input() disabled = false;
  @Input('thumbnail-scale') thumbScale = 'normal';

  @Output() selected = new EventEmitter<Event>();

  fiat = 0;

  constructor() {}

  onSelectWallet(e) {
    this.selected.emit(e);
  }

  get isEmpty(): boolean {
    return !this.wallet;
  }
}
