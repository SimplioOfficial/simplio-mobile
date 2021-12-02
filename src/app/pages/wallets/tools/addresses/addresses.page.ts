import { Router } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';

import { Subscription } from 'rxjs';

import { copyInputMessage, UtilsService } from 'src/app/services/utils.service';
import { Wallet, WalletType } from 'src/app/interface/data';
import { Translate } from 'src/app/providers/translate/';
import { SettingsProvider } from 'src/app/providers/data/settings.provider';
@Component({
  selector: 'app-addresses',
  templateUrl: './addresses.page.html',
  styleUrls: ['./addresses.page.scss'],
})
export class AddressesPage implements OnInit, OnDestroy {
  wallet = this.router.getCurrentNavigation().extras.state?.wallet as Wallet;
  name: string;
  walletSubscription: Subscription;
  isErc = false;
  locale: string;
  private subscription = new Subscription();

  constructor(
    private router: Router,
    private utilsService: UtilsService,
    public $: Translate,
    private settingsProvider: SettingsProvider,
  ) {}

  ngOnInit() {
    this.isErc =
      UtilsService.isErcCoin(this.wallet.type) || UtilsService.isErcToken(this.wallet.type);
    const settingsSubscription = this.settingsProvider.settings$.subscribe(s => {
      this.locale = s.language || 'en';
    });

    this.subscription.add(settingsSubscription);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  back() {
    this.router.navigate(['/home', 'wallets', this.wallet.name, 'overview', 'tools'], {
      state: { wallet: this.wallet },
    });
  }

  copy(value) {
    copyInputMessage(value);
    this.utilsService.showToast([this.$.COPIED_TO_CLIPBOARD, value]);
  }

  showInfo() {
    this.utilsService.presentAlert({
      message: this.$.LIST_OF_WALLET_ADDRESSES_WITH_CURRENT_BALANCE,
    });
  }
}
