import { Component, Input, OnInit } from '@angular/core';
import { platform } from '@simplio/backend/utils';
import { CoinItem } from 'src/assets/json/coinlist';

@Component({
  selector: 'sio-coin-item',
  templateUrl: './sio-coin-item.component.html',
  styleUrls: ['../generic-item.scss', './sio-coin-item.component.scss'],
})
export class SioCoinItemComponent implements OnInit {
  @Input() coin: CoinItem;

  constructor() {}

  ngOnInit() {}

  get platform(): string {
    return platform(this.coin.type, this.coin.ticker);
  }

  get origin(): string {
    return this.coin.origin;
  }
}
