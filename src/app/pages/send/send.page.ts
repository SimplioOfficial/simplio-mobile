import { Component, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoadingController, ModalController } from '@ionic/angular';
import { DataService } from 'src/app/services/data.service';
import { pipeAmount, UtilsService } from 'src/app/services/utils.service';
import { WalletType, Rate, FeeResponse, FeeName } from 'src/app/interface/data';
import { WalletService } from 'src/app/services/wallet.service';
import { Wallet } from 'src/app/interface/data';
import { TransactionOptionsModal } from 'src/app/pages/modals/transaction-options-modal/transaction-options.modal';
import { TransactionWalletsModal } from 'src/app/pages/modals/transaction-wallets-modal/transaction-wallets.modal';
import { SioValueComponent } from 'src/app/components/form/sio-value/sio-value.component';
import { SettingsProvider } from 'src/app/providers/data/settings.provider';
import { AuthenticationProvider } from 'src/app/providers/data/authentication.provider';
import { WalletsProvider } from 'src/app/providers/data/wallets.provider';
import { isGreaterThan, isLowerThan } from 'src/shared/validators';
import { Translate } from 'src/app/providers/translate/';
import { getPrice } from 'src/app/services/wallets/utils';
import { RateService } from 'src/app/services/apiv2/connection/rate.service';
import { TxcoinService } from 'src/app/services/apiv2/transaction/txcoin.service';
import { NetworkService } from 'src/app/services/apiv2/connection/network.service';
import { Feev2Service } from 'src/app/services/apiv2/connection/feev2.service';
import { SioNumpadComponent } from 'src/app/components/form/sio-numpad/sio-numpad.component';
import { coinNames } from '../../services/api/coins';
import { TranslateService } from '@ngx-translate/core';
import { TrackedPage } from '../../classes/trackedPage';

@Component({
  selector: 'app-send',
  templateUrl: './send.page.html',
  styleUrls: ['./send.page.scss'],
})
export class SendPage extends TrackedPage implements OnDestroy {
  private _fees: FeeResponse;

  readonly numTypes = SioNumpadComponent.TYPES;
  private _originUrl = this.router.getCurrentNavigation().extras.state?.origin || '/home/wallets';
  fee = 0;
  rate = 0;
  minFee = 0;
  loading: any;
  feeLevels: FeeName[] = Object.values(FeeName) as FeeName[];
  isMax = false;

  currency = this.settingsProvider.settingsValue.currency;
  locale = this.settingsProvider.settingsValue.language;
  feePolicy = this.settingsProvider.settingsValue.feePolicy;
  wallets: Wallet[] = [];
  wallet: Wallet = null;

  @ViewChild(SioValueComponent) valueComponent: SioValueComponent;

  formField: FormGroup = this.fb.group(
    {
      wallet: [null, [Validators.required]],
      amount: [0, [Validators.required, isGreaterThan(0), this._validateSuficiencty.bind(this)]],
      feeLevelName: [this.feePolicy, [Validators.required]],
    },
    {
      validators: [isLowerThan],
    },
  );

  wallets$ = this.walletsProvider.wallets$.subscribe(w => (this.wallets = w));

  private _wallet = new BehaviorSubject<Wallet>(
    this.router.getCurrentNavigation().extras.state?.wallet || this.walletsProvider.walletValue,
  );
  wallet$ = this._wallet
    .pipe(
      tap(w => {
        this.wallet = w;
        this.rate = this.getPrice(this.rateService.rateValue, w.ticker, this.currency);
        this.formField.patchValue({ wallet: w });
      }),
    )
    .subscribe();

  instant = s => this.translateService.instant(s);

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private loadingController: LoadingController,
    private walletService: WalletService,
    private feeService: Feev2Service,
    private settingsProvider: SettingsProvider,
    private utilsService: UtilsService,
    private rateService: RateService,
    private dataService: DataService,
    private authProvider: AuthenticationProvider,
    public $: Translate,
    private walletsProvider: WalletsProvider,
    private txcoin: TxcoinService,
    private networkService: NetworkService,
    private translateService: TranslateService,
  ) {
    super();
    this.feeService.getFee().then(res => (this._fees = res));
  }

  get selectedWallet(): Wallet {
    return this.formField.get('wallet').value;
  }

  get feeLevelName(): string {
    return this.formField.get('feeLevelName').value;
  }

  get selectedFiat(): number {
    if (!this.selectedWallet) return;
    const { balance, ticker, type, decimal } = this.selectedWallet;
    return pipeAmount(balance, ticker, type, decimal, true) * this.rate;
  }

  ngOnDestroy(): void {
    this.wallet$.unsubscribe();
    this.wallets$.unsubscribe();
  }

  onAmountChange(value: number) {
    this.valueComponent.updateInputValue(value);
  }

  onMaxClick(value: boolean) {
    this.isMax = value;
  }

  private _navigateWithUrl(url) {
    return this.router.navigate(url, {
      state: {
        wallet: this.wallet,
        origin: this._originUrl,
      },
    });
  }
  /**
   *
   * @todo too complex logic. Simplify!
   */
  async onSubmit() {
    if (UtilsService.isCoin(this.wallet.type)) {
      await this.presentLoading();
    }
    this.dataService.initTransaction();

    try {
      const { amount, feeLevelName: fl } = this.formField.value;
      const { idt } = this.authProvider.accountValue;

      const fiatAmount = parseFloat((amount * this.rate).toFixed(8));
      this.dataService.unsignedTransaction.fiat = {
        type: this.currency,
        rate: this.rate,
        amount: fiatAmount,
      };

      this.dataService.unsignedTransaction.feepipe = {
        ticker: this.wallet.ticker,
        type: this.wallet.type,
        decimal: this.wallet.decimal,
      };
      switch (this.wallet.type) {
        case WalletType.BSC_TOKEN:
          this.dataService.unsignedTransaction.feepipe = {
            ticker: coinNames.BNB,
            type: WalletType.BSC,
            decimal: 18,
          };
          break;
        case WalletType.SOLANA_TOKEN:
        case WalletType.SOLANA_TOKEN_DEV:
          this.dataService.unsignedTransaction.feepipe = {
            ticker: coinNames.SOL,
            type: WalletType.SOLANA,
            decimal: 9,
          };
          break;
        case WalletType.ETH_TOKEN:
          this.dataService.unsignedTransaction.feepipe = {
            ticker: coinNames.ETC,
            type: WalletType.ETH,
            decimal: 18,
          };
          break;
        default:
          break;
      }
      this.dataService.unsignedTransaction.mnemo = this.walletService.getSeeds(
        this.wallet.mnemo,
        idt,
      );
      this.dataService.unsignedTransaction.amount = amount;
      this.dataService.unsignedTransaction.wallet = this.wallet;

      this.dataService.unsignedTransaction.fee.price = await this.feeService.getFeePrice(
        this.wallet.ticker,
        this.wallet.type,
        fl,
      );
      this.dataService.unsignedTransaction.fee.minFee = this.feeService.getMinFee(
        this.wallet.ticker,
      );

      this.dataService.unsignedTransaction.isMax = this.isMax;
      // Routing to address page
      if (UtilsService.isCoin(this.wallet.type)) {
        let explorers = this.networkService.getCoinExplorers(this.wallet.ticker, this.wallet.type);
        explorers = explorers.filter(e => e.type === explorers[0].type);
        this.txcoin
          .getUtxo({ explorers, addresses: this.wallet.addresses.map(a => a.address) })
          .then(res => {
            if (res.utxos.length > 0) {
              this.dataService.unsignedTransaction.utxo = res.utxos;
              this.dataService.unsignedTransaction.explorer = res.explorer;
              this._navigateWithUrl(['home', 'wallets', 'send', 'sendaddress']).then(() =>
                this.dismissLoading(),
              );
            } else {
              throw new Error('Could not find any coin to spend');
            }
          });
      } else {
        this._navigateWithUrl(['home', 'wallets', 'send', 'sendaddress']);
      }
    } catch (e) {
      this.utilsService.showToast(e.message, 3000, 'warning').then(() => {
        this.dataService.cleanTransaction();
      });
    }
  }

  private _presentModal(modal, props = {}): Promise<HTMLIonModalElement> {
    return this.modalCtrl
      .create({
        component: modal,
        componentProps: props,
      })
      .then(modal => {
        modal.present();
        return modal;
      });
  }

  async openOptionsModal() {
    const modal = await this._presentModal(TransactionOptionsModal, {
      ticker: this.selectedWallet.ticker,
      feeLevelName: this.formField.get('feeLevelName').value,
      currency: this.currency,
    });
    modal.onWillDismiss().then(options => {
      if (options.data) {
        const { fee } = options.data;
        this.formField.patchValue({ feeLevelName: fee });
      }
    });
  }

  async openSelectWalletModal() {
    const modal = await this._presentModal(TransactionWalletsModal, {
      wallets: this.wallets.filter(w => w !== this.selectedWallet),
      currency: this.currency,
    });
    modal
      .onWillDismiss()
      .then(wallet => {
        if (wallet.data) {
          this._wallet.next(wallet.data);

          const coin = wallet.data.ticker.toLowerCase();
          if (this._fees[coin]) {
            // this.feeLevels = this._fees[coin].feeLevels;
            this.minFee = this._fees[coin].minFee;
            const feeLevelName = this.feeLevels.find(f => f === this.feeLevelName);
            this.formField.patchValue({ feeLevelName });
          }
        }
      })
      .catch(_ =>
        this.utilsService.showToast(this.$.WALLET_COULD_NOT_BE_SELECTED, 2000, 'warning'),
      );
  }

  private _validateSuficiencty(c: FormControl): Validators {
    return Validators.max(this.wallet?.balance || 0)(c);
  }

  getPrice(rates: Rate[], ticker: string, currency: string): number {
    return getPrice(rates, ticker, currency);
  }

  async cancelTransaction() {
    this.router.navigateByUrl(this._originUrl);
    this.dataService.cleanTransaction();
  }

  async presentLoading() {
    this.loading = await this.loadingController.create({
      message: this.instant(this.$.PREPARING_DATA),
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
