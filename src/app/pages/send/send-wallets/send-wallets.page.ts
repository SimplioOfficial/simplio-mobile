import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Wallet } from 'src/app/interface/data';
import { DataService } from 'src/app/services/data.service';
import { WalletService } from 'src/app/services/wallet.service';
import { pipeAmount, UtilsService } from 'src/app/services/utils.service';
import { SettingsProvider } from 'src/app/providers/data/settings.provider';
import { Translate } from 'src/app/providers/translate/';
import { getPrice } from 'src/app/services/wallets/utils';
import { RateService } from 'src/app/services/apiv2/connection/rate.service';

@Component({
  selector: 'app-send-wallets',
  templateUrl: './send-wallets.page.html',
  styleUrls: ['./send-wallets.page.scss'],
})
export class SendWalletsPage implements OnInit, OnDestroy {
  wallets: Wallet[] = [];
  rate: any;
  settingsSubscription: Subscription;
  currency: string;

  constructor(
    private walletService: WalletService,
    private dataService: DataService,
    private rateService: RateService,
    private utilsService: UtilsService,
    private settingsProvider: SettingsProvider,
    public $: Translate,
  ) {}

  ngOnInit() {
    this.currency = this.settingsProvider.currency;
    this.wallets = this.walletService.data.wallets;
    this.rate = this.rateService.rateValue;
  }

  ngOnDestroy() {
    this.settingsSubscription.unsubscribe();
  }

  getFiatValue(w: Wallet): number {
    return (
      pipeAmount(w.balance, w.ticker, w.type, w.decimal, true) *
      this.getPrice(w.ticker, this.currency)
    );
  }

  getPrice(ticker: string, currency: string): number {
    return getPrice(this.rate, ticker, currency);
  }

  selectWallet(w: Wallet) {
    this.dataService.unsignedTransaction.wallet = w;
  }
}
