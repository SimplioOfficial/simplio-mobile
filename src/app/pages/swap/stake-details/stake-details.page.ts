import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Pool } from '@simplio/backend/interface/stake';
import { map, skipWhile } from 'rxjs/operators';
import { TrackedPage } from 'src/app/classes/trackedPage';
import { Rate, Stake, TxType, Wallet, WalletType } from 'src/app/interface/data';
import { SettingsProvider } from 'src/app/providers/data/settings.provider';
import { WalletsProvider } from 'src/app/providers/data/wallets.provider';
import { Translate } from 'src/app/providers/translate/service';
import { RateService } from 'src/app/services/apiv2/connection/rate.service';
import { getCurrencyNetwork } from 'src/app/services/swap/utils';
import { getAPY, isToken, parseError, tokenId, UtilsService } from 'src/app/services/utils.service';
import { findPrimaryWallet } from 'src/app/services/wallets/utils';
import { Location } from '@angular/common';
import { AuthenticationProvider } from 'src/app/providers/data/authentication.provider';
import { IoService } from 'src/app/services/io.service';
import { LoadingController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { BackendService } from 'src/app/services/apiv2/blockchain/backend.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'stake-details-page',
  templateUrl: './stake-details.page.html',
  styleUrls: ['./stake-details.page.scss']
})
export class StakeDetailsPage extends TrackedPage implements OnInit {

  wallet: Wallet = this.router.getCurrentNavigation().extras.state?.wallet;
  stake: Stake = this.router.getCurrentNavigation().extras.state?.stake;
  earned = this.router.getCurrentNavigation().extras.state?.earned;
  pool: Pool = this.router.getCurrentNavigation().extras.state?.pool;

  _loading;
  rate$ = this.rateService.rate$.pipe(
    skipWhile(rates => !rates),
    map(rates => rates.reduce((acc: number, curr: Rate) => {
      if (curr.code === 'SOL') (acc = curr.rate)
      return acc
    }, 1)),
  );

  instant = s => this.translateService.instant(s);

  constructor(
    public $: Translate,
    private rateService: RateService,
    private utilsService: UtilsService,
    private router: Router,
    private route: ActivatedRoute,
    private walletsProvider: WalletsProvider,
    private settingsProvider: SettingsProvider,
    private location: Location,
    private authProvider: AuthenticationProvider,
    private io: IoService,
    private loadingController: LoadingController,
    private translateService: TranslateService,
    private backendService: BackendService
  ) {
    super();
  }

  dummyTransactions = [
    {
      amount: 1000,
      fiatAmount: 0,
      currency: 'USD',
      date: new Date().toUTCString(),
      address: 'dowehdhwiehdiuwehd',
      ticker: 'SIO',
      type: TxType.SEND,
    },
    {
      amount: 2000,
      fiatAmount: 0,
      currency: 'USD',
      date: new Date().toUTCString(),
      address: 'dowehdhwiehdiuwehd',
      ticker: 'SIO',
      type: TxType.RECEIVE,
    },
    {
      amount: 1000,
      fiatAmount: 0,
      currency: 'USD',
      date: new Date().toUTCString(),
      address: 'dowehdhwiehdiuwehd',
      ticker: 'SIO',
      type: TxType.RECEIVE,
    },
    {
      amount: 1000,
      fiatAmount: 0,
      currency: 'USD',
      date: new Date().toUTCString(),
      address: 'dowehdhwiehdiuwehd',
      ticker: 'SIO',
      type: TxType.RECEIVE,
    },
  ];

  ngOnInit() { }

  get network() {
    return getCurrencyNetwork(this.wallet.type, this.wallet.ticker);
  }

  get getAPY(): number {
    return getAPY(this.pool)
  }

  async openUnstakePrompt() {
    const alert = await this.utilsService.createAlert({
      header: this.$.UNSTAKE_PROPT_TITLE,
      message: '',
      buttons: [
        {
          text: this.$.CANCEL,
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: this.$.ACTION_UNSTAKE,
          handler: () => {
            this._unstake();
          },
        },
      ],
    });
    await alert.present();
  }

  async openHarvestPrompt() {
    const alert = await this.utilsService.createAlert({
      header: this.$.HARVEST_PROPT_TITLE,
      message: '',
      buttons: [
        {
          text: this.$.CANCEL,
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: this.$.ACTION_HARVEST,
          handler: () => {
            this._harvest();
          },
        },
      ],
    });
    await alert.present();
  }

  openStake() {
    console.log(this.location.path())
    this.router.navigate(['home', 'swap', 'stake'], {
      state: {
        origin: "/home",
        wallet: this.wallet
      },
    });
  }

  private async _unstake(): Promise<void> {
    // TODO - add unstake logic.
    const { idt } = this.authProvider.accountValue;
    const seeds = this.io.decrypt(this.wallet.mnemo, idt);
    await this._presentLoading(this.$.CANCELLING_STAKE);
    this.backendService.stake.cancel(seeds, this.stake.stakingAccount, environment.PROGRAM_ID, this.wallet.api).then(async _ => {
      await this._closeLoading();
      this.utilsService.showToast(this.$.CANCELLED_SUCCESS);
      this.router.navigate(['..'], {
        relativeTo: this.route.parent
      });
    })
      .catch(err => {
        this._closeLoading();
        this.utilsService.showToast(parseError(err.message), 3000, 'warning');
      });;
  }

  private async _harvest(): Promise<void> {
    const { idt } = this.authProvider.accountValue;
    const seeds = this.io.decrypt(this.wallet.mnemo, idt);
    await this._presentLoading(this.$.ACTION_HARVESTING);
    this.backendService.stake.withdrawInterest(seeds, this.stake.stakingAccount, environment.PROGRAM_ID, this.wallet.decimal, this.wallet.api).then(async res => {
      await this._closeLoading();
      this.earned = 0;
      this.utilsService.showToast(this.$.HARVESTED_SUCCESS)
    })
      .catch(err => {
        this._closeLoading();
        this.utilsService.showToast(parseError(err.message), 3000, 'warning');
      });
  }

  private async _presentLoading(message) {
    this._loading = await this.loadingController.create({
      message: this.instant(message),
      duration: 60000
    });
    await this._loading.present();
  }

  private async _closeLoading() {
    if (this._loading) {
      await this._loading.dismiss();
    }
  }

  isToken(type: WalletType) {
    return isToken(type);
  }

  tokenId(type: WalletType) {
    return tokenId(type);
  }
}
