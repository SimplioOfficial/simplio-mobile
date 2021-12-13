import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { filter, tap } from 'rxjs/operators';
import { LoadingController, ModalController, NavController } from '@ionic/angular';
import { DataService } from 'src/app/services/data.service';
import { copyInputMessage, pipeAmount, UtilsService } from 'src/app/services/utils.service';
import { SettingsProvider } from 'src/app/providers/data/settings.provider';
import { WalletsProvider } from 'src/app/providers/data/wallets.provider';
import { Translate } from 'src/app/providers/translate/';
import { Rate, Wallet, WalletsData, WalletType } from 'src/app/interface/data';
import { TransactionWalletsModal } from 'src/app/pages/modals/transaction-wallets-modal/transaction-wallets.modal';
import { getPrice } from 'src/app/services/wallets/utils';
import { IoService } from 'src/app/services/io.service';
import { RateService } from 'src/app/services/apiv2/connection/rate.service';
import { AuthenticationProvider } from 'src/app/providers/data/authentication.provider';
import { TranslateService } from '@ngx-translate/core';
import { coinNames } from 'src/app/services/api/coins';
import { CheckWalletsService } from 'src/app/services/wallets/check-wallets.service';
import { TrackedPage } from '../../classes/trackedPage';
import { BackendService } from 'src/app/services/apiv2/blockchain/backend.service';

type RouteData = {
  wallets: WalletsData;
};

@Component({
  selector: 'app-receive',
  templateUrl: './receive.page.html',
  styleUrls: ['./receive.page.scss'],
})
export class ReceivePage extends TrackedPage implements OnDestroy {

  private _wallets: Wallet[] = [];
  private _wallet = new BehaviorSubject<Wallet>(null); 
  wallet$ = this._wallet.pipe(
    tap(w => {
      this.rate = this.getPrice(this.rateService.rateValue, w.ticker, this.currency);
    }),
  );

  private _routeData = this.route.data
    .pipe(filter(d => !!d))
    .subscribe(this._onRouteDataSubscription.bind(this));

  private loading;
  currency = this.settingsProvider.settingsValue.currency;
  locale = this.settingsProvider.settingsValue.language;
  rate = 0;
  private _originUrl = this.router.getCurrentNavigation().extras.state?.origin || '/home/wallets';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authProvider: AuthenticationProvider,
    private rateService: RateService,
    private utilsService: UtilsService,
    private settingsProvider: SettingsProvider,
    private dataService: DataService,
    private modalCtrl: ModalController,
    private io: IoService,
    private backendService: BackendService,
    private checker: CheckWalletsService,
    public $: Translate,
    private loadingController: LoadingController,
  ) {
    super();
    this.dataService.initTransaction();
  }

  ngOnDestroy(): void {
    this._routeData.unsubscribe();
  }

  get selectedWallet(): Wallet {
    return this._wallet.value;
  }

  get isInitialized(): boolean {
    if (!this.selectedWallet?.type) return false;

    if (!UtilsService.isSolanaToken(this.selectedWallet.type)) return true;
    return this.selectedWallet.isInitialized;
  }

  private _onRouteDataSubscription({ wallets: w }: RouteData) {
    this._wallets = w.wallets;
    this._wallet.next(w.primaryWallet);
  }

  async cancelTransaction() {
    this.router.navigateByUrl(this._originUrl);
    this.dataService.cleanTransaction();
  }

  /* To copy Text from Textbox */
  copy(value) {
    copyInputMessage(value);
    this.utilsService.showToast(this.$.COPIED_TO_CLIPBOARD);
  }

  getPrice(rates: Rate[], ticker: string, currency: string): number {
    return getPrice(rates, ticker, currency);
  }

  async openSelectWalletModal() {
    const modal = await this.openModal(TransactionWalletsModal);
    modal
      .onWillDismiss()
      .then(wallet => {
        if (wallet.data) {
          this._wallet.next(wallet.data);
        }
      })
      .catch(_ => {
        this.utilsService.showToast(this.$.WALLET_COULD_NOT_BE_SELECTED, 2000, 'warning');
      });
  }

  get currentAddress(): string {
    return this.selectedWallet?.mainAddress || '';
  }

  get fiatValue(): number {
    if (!this.selectedWallet) return 0;
    const { balance, ticker, type, decimal } = this.selectedWallet;
    return pipeAmount(balance, ticker, type, decimal, true) * this.rate;
  }

  private openModal(modalComponent): Promise<any> {
    return this.modalCtrl
      .create({
        component: modalComponent,
        componentProps: {
          wallets: this._wallets.filter(w => w._uuid !== this.selectedWallet._uuid),
          currency: this.currency,
        },
      })
      .then(modal => {
        modal.present();
        return modal;
      });
  }

  async presentCreateTokenAccountPrompt() {
    const minimumRent = await this.backendService.solana.getMinimumRentExemption({
      api: this.selectedWallet.api,
    });
    const alertMsg = this.$.instant(this.$.CREATE_NEW_SOLANA_TOKEN_ACCOUNT_FEE);

    const alert = await this.utilsService.createAlert({
      header: this.$.CREATE_NEW_SOLANA_TOKEN_ACCOUNT,
      message: alertMsg.replace(
        '<value>',
        pipeAmount(
          minimumRent,
          coinNames.SOL,
          WalletType.SOLANA,
          UtilsService.getDecimals(WalletType.SOLANA, coinNames.SOL),
          true,
        ).toString(),
      ),
      buttons: [
        {
          text: this.$.CANCEL,
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: this.$.CREATE,
          handler: async () => {
            const { idt } = this.authProvider.accountValue;

            const solWallet = this._wallets.find(
              e => e.ticker === coinNames.SOL && UtilsService.isSolana(e.type),
            );
            if (!solWallet || (minimumRent > solWallet.balance && !UtilsService.isSolanaDev(this.selectedWallet.type))) {
              let errorMsg = this.$.instant(this.$.CREATE_NEW_SOLANA_TOKEN_ACCOUNT_ERROR);
              throw new Error(
                errorMsg.replace(
                  '<value>',
                  pipeAmount(
                    minimumRent,
                    this.selectedWallet.ticker,
                    this.selectedWallet.type,
                    this.selectedWallet.decimal,
                    true,
                  ).toString(),
                ),
              );
            }
            await this.presentLoading(this.$.INITIALIZING_TOKEN);
            this.backendService.solana
              .createTokenAddress({
                address: this.selectedWallet.mainAddress,
                api: this.selectedWallet.api,
                contractAddress: this.selectedWallet.contractaddress,
                seeds: this.io.decrypt(this.selectedWallet.mnemo, idt),
                addressType: this.selectedWallet.addressType
              })
              .then(_ => {
                this.checker.checkTransactions(
                  {
                    wallets: [this.selectedWallet],
                    important: true,
                  },
                  () => {
                    this.dismissLoading();
                    this.rateService.refresh(false);
                  },
                );
              })
              .catch(error => {
                this.dismissLoading();
                this.utilsService.showToast(error.message, 2000, 'warning');
              });
          },
        },
      ],
    });
    await alert.present();
  }

  async presentLoading(msg) {
    this.loading = await this.loadingController.create({
      message: this.$.instant(msg),
      duration: 25000,
    });
    await this.loading.present();
  }

  async dismissLoading() {
    if (this.loading) {
      await this.loading.dismiss();
    }
  }
}
