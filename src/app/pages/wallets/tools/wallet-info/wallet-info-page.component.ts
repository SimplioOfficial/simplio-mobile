import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs';

import { Translate } from 'src/app/providers/translate/';
import { Wallet } from 'src/app/interface/data';
import { WalletService } from 'src/app/services/wallet.service';
import { DataProvider } from 'src/app/providers/data/data';

@Component({
  selector: 'app-wallet-info',
  templateUrl: './wallet-info-page.component.html',
  styleUrls: ['./wallet-info-page.component.scss'],
})
export class WalletInfoPage implements OnInit, OnDestroy {
  wallet: Wallet;
  name: string;
  walletSubscription: Subscription;

  constructor(
    private walletService: WalletService,
    private dataProvider: DataProvider,
    public $: Translate,
  ) {}

  ngOnInit() {
    this.name = this.dataProvider.walletName;
    this.wallet = this.walletService.getWallet(this.name);

    this.walletSubscription = this.walletService.walletData.subscribe(data => {
      if (data) {
        this.name = this.dataProvider.walletName;
        const index = data.wallets.findIndex(e => e.name === this.name);
        if (index > -1) {
          this.wallet = data.wallets[index];
          this.name = this.wallet.name;
        } else {
          console.log('Wallet ' + this.name + ' is not existed');
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.walletSubscription) {
      this.walletSubscription.unsubscribe();
    }
  }
}
