import { ActivatedRoute, Router } from '@angular/router';
import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { copyInputMessage, UtilsService } from 'src/app/services/utils.service';
import { SettingsProvider } from 'src/app/providers/data/settings.provider';
import { Translate } from 'src/app/providers/translate/';
import { BalancePipe } from 'src/app/pipes/balance.pipe';
import { FiatPipe } from 'src/app/pipes/fiat.pipe';
import { NetworkService } from 'src/app/services/apiv2/connection/network.service';
import { Browser } from '@capacitor/browser';
import { Wallet } from 'src/app/interface/data';

@Component({
  selector: 'overview-transactions-page',
  templateUrl: './overview-transactions.page.html',
  styleUrls: ['./overview-transactions.page.scss'],
})
export class OverviewTransactionsPage {
  private _routerState = this.router.getCurrentNavigation().extras?.state;
  transactions = this._routerState?.transactions ?? [];
  wallet = this._routerState?.wallet;

  currency = this.settingsProvider.settingsValue.currency;
  locale = this.settingsProvider.settingsValue.language;
  feePolicy = this.settingsProvider.settingsValue.feePolicy;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private alertController: AlertController,
    private utilsService: UtilsService,
    private networkService: NetworkService,
    private settingsProvider: SettingsProvider,
    public $: Translate,
  ) {}

  back() {
    this.router.navigate(['..'], {
      relativeTo: this.route.parent,
    });
  }

  async openTransaction({ ticker, address, amount, type, hash }, wallet: Wallet) {
    const makeMsg = (
      type: number,
      amount: number,
      ticker: string,
      address: string,
      decimal: number,
    ) => {
      const balance = BalancePipe.prototype.transform(amount, ticker, wallet.type, decimal);
      const a = FiatPipe.prototype.transform(balance, this.currency, this.locale, true);
      const sent = `${this.$.instant(
        this.$.YOU_HAVE_SENT,
      )} <strong>${a} ${ticker}</strong> <br /><br />${this.$.instant(
        this.$.DESTINATION_ADDRESS,
      )}: <br /> <small>${address}</small>`;
      const received = `${this.$.instant(
        this.$.YOU_HAVE_RECEIVED,
      )} <strong>${a} ${ticker}</strong> <br /><br /> ${this.$.instant(
        this.$.SOURCE_ADDRESS,
      )}: <br /> <small>${address}</small>`;

      return !!type ? received : sent;
    };
    const alert = await this.alertController.create({
      message: makeMsg(type, amount, ticker, address, this.wallet.decimal),
      buttons: [
        {
          text: this.$.instant(this.$.EXPLORER),
          cssClass: 'danger',
          handler: () => {
            const coinType = wallet.type;
            const explorer = this.networkService.getCoinExplorers(ticker, coinType);
            if (this.utilsService.isValidType(coinType) && !!explorer) {
              Browser.open({
                url: `${explorer.pop().url}/tx/${hash}`,
              });
            } else {
              this.utilsService.showToast(this.$.instant(this.$.UPDATED_SOON));
            }
          },
        },
        {
          text: this.$.instant(this.$.COPY_ADDRESS),
          handler: () => this.copy(address),
        },
        {
          text: this.$.instant(this.$.OK),
        },
      ],
    });
    await alert.present();
  }

  copy(value) {
    copyInputMessage(value);
    this.utilsService.showToast(this.$.instant(this.$.COPIED_TO_CLIPBOARD));
  }
}
