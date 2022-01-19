import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { LoadingController, ModalController } from '@ionic/angular';
import { DataService } from 'src/app/services/data.service';
import { parseError, pipeAmount, UtilsService } from 'src/app/services/utils.service';
import { WalletType, Rate, FeeResponse, FeeName } from 'src/app/interface/data';
import { WalletService } from 'src/app/services/wallet.service';
import { Wallet } from 'src/app/interface/data';
import { TransactionWalletsModal } from 'src/app/pages/modals/transaction-wallets-modal/transaction-wallets.modal';
import { SioValueComponent } from 'src/app/components/form/sio-value/sio-value.component';
import { SettingsProvider } from 'src/app/providers/data/settings.provider';
import { AuthenticationProvider } from 'src/app/providers/data/authentication.provider';
import { WalletsProvider } from 'src/app/providers/data/wallets.provider';
import { isGreaterThan, isLessThan } from 'src/shared/validators';
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
import { IoService } from 'src/app/services/io.service';
import { environment } from 'src/environments/environment';
import { BackendService } from 'src/app/services/apiv2/blockchain/backend.service';

@Component({
  selector: 'stake',
  templateUrl: './stake.page.html',
  styleUrls: ['./stake.page.scss'],
})
export class StakePage extends TrackedPage implements OnDestroy, OnInit {
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
  wallet: Wallet =
    this.router.getCurrentNavigation().extras.state?.wallet || this.walletsProvider.walletValue;
  pool;
  seeds;
  @ViewChild(SioValueComponent) valueComponent: SioValueComponent;

  formField: FormGroup = this.fb.group(
    {
      wallet: [null, [Validators.required]],
      amount: [0, [Validators.required, isGreaterThan(0), this._validateSuficiencty.bind(this)]],
    },
    {
      validators: [isLessThan],
    },
  );

  wallets$ = this.walletsProvider.wallets$.subscribe(async w => {
    this.wallets = w;
    if (!this.wallet) {
      this.wallet = this.wallets.find(
        e => e.ticker === coinNames.SIO && e.type === WalletType.SOLANA_TOKEN_DEV,
      );
      this.rate = getPrice(this.rateService.rateValue, this.wallet.ticker, this.currency);
      this.formField.patchValue({ wallet: this.wallet });
      const { idt } = this.authProvider.accountValue;
      this.seeds = this.io.decrypt(this.wallet.mnemo, idt);
      this.pool = await this.backendService.stake.getPool(
        environment.POOL_ADDRESS,
        this.wallet.decimal,
        this.wallet.api,
      );
    }
  });

  // private _wallet = new BehaviorSubject<Wallet>(
  //   this.router.getCurrentNavigation().extras.state?.wallet || this.walletsProvider.walletValue,
  // );

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
    private io: IoService,
    public $: Translate,
    private walletsProvider: WalletsProvider,
    private txcoin: TxcoinService,
    private networkService: NetworkService,
    private translateService: TranslateService,
    private backendService: BackendService,
  ) {
    super();
    this.feeService.getFee().then(res => (this._fees = res));
  }

  get selectedWallet(): Wallet {
    return this.formField.get('wallet').value;
  }

  get selectedFiat(): number {
    if (!this.selectedWallet) return;
    const { balance, ticker, type, decimal } = this.selectedWallet;
    return pipeAmount(balance, ticker, type, decimal, true) * this.rate;
  }

  ngOnInit(): void {
    this.formField.patchValue({ wallet: this.wallet });
  }
  ngOnDestroy(): void {
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
    const { amount } = this.formField.value;
    const { idt } = this.authProvider.accountValue;
    const seeds = this.io.decrypt(this.wallet.mnemo, idt);
    this.presentLoading();
    this.backendService.stake
      .initStake(
        seeds,
        this.wallet.contractaddress,
        environment.POOL_ADDRESS,
        amount,
        this.wallet.decimal,
        environment.PROGRAM_ID,
        this.wallet.api,
      )
      .then(async _ => {
        await this.dismissLoading();
        this.router.navigate(['home', 'swap', 'stake', 'confirm'], {
          state: {
            wallet: this.wallet,
            amount: amount,
          },
        });
      })
      .catch(err => {
        this.dismissLoading();
        console.log(err);
        this.utilsService.showToast(parseError(err.message), 3000, 'warning');
      });
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

  async openSelectWalletModal() {
    const modal = await this._presentModal(TransactionWalletsModal, {
      wallets: this.wallets.filter(w => w !== this.selectedWallet),
      currency: this.currency,
    });
    modal
      .onWillDismiss()
      .then(wallet => {
        if (wallet.data && this.wallet !== wallet.data) {
          this.wallet = wallet.data;
          this.rate = getPrice(this.rateService.rateValue, this.wallet.ticker, this.currency);
          this.formField.patchValue({ wallet: this.wallet });
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
      message: this.instant(this.$.INITIALIZING_STAKE),
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
