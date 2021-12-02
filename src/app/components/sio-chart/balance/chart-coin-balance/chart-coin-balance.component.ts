import { Component, OnChanges, Input, SimpleChanges } from '@angular/core';

import { Wallet } from 'src/app/interface/data';

@Component({
  selector: 'sio-chart-coin-balance',
  templateUrl: './chart-coin-balance.component.html',
  styleUrls: ['./chart-coin-balance.component.scss', '../generic-balance.scss'],
})
export class SioChartCoinBalanceComponent implements OnChanges {
  @Input() selectedBalance: { unixtime: string; balance: number } | null = null;
  @Input() totalBalance: number;
  @Input() totalCoinBalance = 0;
  @Input() ticker = '';
  @Input() wallet: Wallet;
  @Input() currency = 'usd';
  @Input() locale = 'en';

  isBalance = false;

  constructor() {}

  ngOnChanges(changes: SimpleChanges) {
    if (!changes.selectedBalance) {
      return;
    }
    this.isBalance = changes.selectedBalance.currentValue !== null;
  }
}
