import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { WalletType } from 'src/app/interface/data';

import { Translate } from 'src/app/providers/translate';

@Component({
  selector: 'sio-chart-balance',
  templateUrl: './chart-balance.component.html',
  styleUrls: ['./chart-balance.component.scss', '../generic-balance.scss'],
})
export class SioChartBalanceComponent implements OnChanges {
  @Input() selectedBalance: { unixtime: string; balance: number } | null = null;
  @Input() totalBalance: number;
  @Input() currency: number;
  @Input() rate: number;
  @Input() btcPrice: number;
  @Input() locale = 'en';

  isBalance = false;

  constructor(public $: Translate) {}

  ngOnChanges(changes: SimpleChanges) {
    if (!changes.selectedBalance) {
      return;
    }
    this.isBalance = changes.selectedBalance.currentValue !== null;
  }

  get balance(): number {
    if (this.totalBalance === 0) {
      return this.totalBalance;
    }
    return parseFloat(this.totalBalance.toFixed(3));
  }

  get balanceBTC(): number {
    if (this.totalBalance === 0) {
      return this.totalBalance;
    }
    return parseFloat((this.totalBalance / this.rate / this.btcPrice).toFixed(8));
  }

  get walletType(): WalletType {
    return WalletType.BITCORE_LIB;
  }
}
