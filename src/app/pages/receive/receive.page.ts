import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoadingController, ModalController, NavController } from '@ionic/angular';
import { DataService } from 'src/app/services/data.service';
import { copyInputMessage, pipeAmount, UtilsService } from 'src/app/services/utils.service';
import { SettingsProvider } from 'src/app/providers/data/settings.provider';
import { WalletsProvider } from 'src/app/providers/data/wallets.provider';
import { Translate } from 'src/app/providers/translate/';
import { Rate, Wallet, WalletType } from 'src/app/interface/data';
import { TransactionWalletsModal } from 'src/app/pages/modals/transaction-wallets-modal/transaction-wallets.modal';
import { getPrice } from 'src/app/services/wallets/utils';
import { IoService } from 'src/app/services/io.service';
import { RateService } from 'src/app/services/apiv2/connection/rate.service';
import { AuthenticationProvider } from 'src/app/providers/data/authentication.provider';
import { TranslateService } from '@ngx-translate/core';
import { coinNames } from '@simplio/backend/api/utils/coins';
import { CheckWalletsService } from 'src/app/services/wallets/check-wallets.service';
import { TrackedPage } from '../../classes/trackedPage';
import { BlockchainService } from 'src/app/services/apiv2/blockchain/blockchain.service';
import { Utils } from '@simplio/backend/utils';

@Component({
  selector: 'app-receive',
  templateUrl: './receive.page.html',
  styleUrls: ['./receive.page.scss'],
})
export class ReceivePage extends TrackedPage implements OnDestroy {
  private loading;
  currency = this.settingsProvider.settingsValue.currency;
  locale = this.settingsProvider.settingsValue.language;
  wallets: Wallet[] = [];
  wallet: Wallet = null;
  rate = 0;
  private _originUrl = this.router.getCurrentNavigation().extras.state?.origin || '/home/wallets';
  private _wallet = new BehaviorSubject<Wallet>(
    this.router.getCurrentNavigation().extras.state?.wallet,
  );
  wallet$ = this._wallet
    .pipe(
      tap(w => {
        this.wallet = w;
        this.rate = this.getPrice(this.rateService.rateValue, w.ticker, this.currency);
      }),
    )
    .subscribe();

  wallets$ = this.walletsProvider.wallets$.subscribe(w => {
    this.wallets = w;
    if (this.wallet) {
      this.wallet = w.find(e => e._uuid === this.wallet._uuid);
    }
  });

  instant = s => this.translateService.instant(s);

  constructor(
    private router: Router,
    private walletsProvider: WalletsProvider,
    private authProvider: AuthenticationProvider,
    private rateService: RateService,
    private utilsService: UtilsService,
    private settingsProvider: SettingsProvider,
    private dataService: DataService,
    private modalCtrl: ModalController,
    private io: IoService,
    private blockchainService: BlockchainService,
    private navCtrl: NavController,
    private translateService: TranslateService,
    private checker: CheckWalletsService,
    public $: Translate,
    private loadingController: LoadingController,
  ) {
    super();
    this.dataService.initTransaction();
  }

  ngOnDestroy(): void {
    this.wallet$.unsubscribe();
    this.wallets$.unsubscribe();
  }

  get isInitialized() {
    if (
      !(UtilsService.isSolanaToken(this.wallet.type) || Utils.isSafecoinToken(this.wallet.type))
    ) {
      return true;
    } else {
      return this.wallet.isInitialized;
    }
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
    return this.wallet?.mainAddress || '';
  }

  get fiatValue(): number {
    if (!this.wallet) return 0;
    const { balance, ticker, type, decimal } = this.wallet;
    return pipeAmount(balance, ticker, type, decimal, true) * this.rate;
  }

  private openModal(modalComponent): Promise<any> {
    const wallets = this.wallets.filter(w => w._uuid !== this.wallet._uuid);
    return this.modalCtrl
      .create({
        component: modalComponent,
        componentProps: {
          wallets,
          currency: this.currency,
        },
      })
      .then(modal => {
        modal.present();
        return modal;
      });
  }

  async presentCreateTokenAccountPrompt() {
    if (UtilsService.isSolanaToken(this.wallet.type)) {
      const minimumRent = await this.blockchainService.solana.getMinimumRentExemption({
        api: this.wallet.api,
      });
      const alertMsg = this.instant(this.$.CREATE_NEW_SOLANA_TOKEN_ACCOUNT_FEE);

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

              const solWallet = this.wallets.find(
                e => e.ticker === coinNames.SOL && UtilsService.isSolana(e.type),
              );
              if (
                !solWallet ||
                (minimumRent > solWallet.balance && !UtilsService.isSolanaDev(this.wallet.type))
              ) {
                const errorMsg = this.instant(this.$.CREATE_NEW_SOLANA_TOKEN_ACCOUNT_ERROR);
                throw new Error(
                  errorMsg.replace(
                    '<value>',
                    pipeAmount(
                      minimumRent,
                      this.wallet.ticker,
                      this.wallet.type,
                      this.wallet.decimal,
                      true,
                    ).toString(),
                  ),
                );
              }
              await this.presentLoading(this.$.INITIALIZING_TOKEN);
              const apiUrl = this.blockchainService.getSolApi({ api: this.wallet.api });
              this.blockchainService.solana
                .createTokenAddress({
                  address: this.wallet.mainAddress,
                  api: apiUrl,
                  contractAddress: this.wallet.contractaddress,
                  seeds: this.io.decrypt(this.wallet.mnemo, idt),
                  addressType: this.wallet.addressType,
                })
                .then(_ => {
                  this.checker.checkTransactions(
                    {
                      wallets: [this.wallet],
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
    } else {
      const minimumRent = await this.blockchainService.safecoin.getMinimumRentExemption({
        api: this.wallet.api,
      });
      const alertMsg = this.instant(this.$.CREATE_NEW_SAFE_TOKEN_ACCOUNT_FEE);

      const alert = await this.utilsService.createAlert({
        header: this.$.CREATE_NEW_SAFE_TOKEN_ACCOUNT,
        message: alertMsg.replace(
          '<value>',
          pipeAmount(
            minimumRent,
            coinNames.SAFE,
            WalletType.SAFE,
            UtilsService.getDecimals(WalletType.SAFE, coinNames.SAFE),
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

              const safeWallet = this.wallets.find(
                e => e.ticker === coinNames.SAFE && Utils.isSafecoin(e.type),
              );
              if (!safeWallet || minimumRent > safeWallet.balance) {
                const errorMsg = this.instant(this.$.CREATE_NEW_SAFE_TOKEN_ACCOUNT_ERROR);
                throw new Error(
                  errorMsg.replace(
                    '<value>',
                    pipeAmount(
                      minimumRent,
                      this.wallet.ticker,
                      this.wallet.type,
                      this.wallet.decimal,
                      true,
                    ).toString(),
                  ),
                );
              }
              await this.presentLoading(this.$.INITIALIZING_TOKEN);
              this.blockchainService.safecoin
                .createTokenAddress({
                  address: this.wallet.mainAddress,
                  api: this.wallet.api,
                  contractAddress: this.wallet.contractaddress,
                  seeds: this.io.decrypt(this.wallet.mnemo, idt),
                  addressType: this.wallet.addressType,
                })
                .then(_ => {
                  this.checker.checkTransactions(
                    {
                      wallets: [this.wallet],
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
  }

  async presentLoading(msg) {
    this.loading = await this.loadingController.create({
      message: this.instant(msg),
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
