import { Component, Input } from '@angular/core';
import { Wallet } from 'src/app/interface/data';
import { Translate } from 'src/app/providers/translate';
import { getCurrencyNetwork } from 'src/app/services/swap/utils';

@Component({
  selector: 'sio-stake-item',
  templateUrl: './sio-stake-item.component.html',
  styleUrls: ['./sio-stake-item.component.scss'],
})
export class SioStakeItemComponent {
  @Input() wallet: Wallet;
  @Input() staked = 0;
  @Input() earned = 0;

  constructor(public $: Translate) {}

  get network() {
    return getCurrencyNetwork(this.wallet.type, this.wallet?.ticker);
  }
}
