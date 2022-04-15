import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription, of, combineLatest } from 'rxjs';
import { map, distinctUntilChanged, tap, filter } from 'rxjs/operators';
import { cloneDeep, isObject } from 'lodash';
import { ModalController, LoadingController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

import {
  Wallet,
  Rate,
  SignedTransaction,
  WalletType,
  UnsignedTransaction,
  WalletsData,
  FeeName,
} from 'src/app/interface/data';
import { WalletService } from 'src/app/services/wallet.service';
import { DataService } from 'src/app/services/data.service';
import { getChainId, pipeAmount, UtilsService } from 'src/app/services/utils.service';
import { TransactionsService } from 'src/app/services/transactions.service';
import { SettingsProvider } from 'src/app/providers/data/settings.provider';
import { AuthenticationProvider } from 'src/app/providers/data/authentication.provider';
import { Acc } from 'src/app/interface/user';
import { Translate } from 'src/app/providers/translate/';
import {
  hasBudgetSwap,
  isAmountValid,
  isDestinationFiatAmountValid,
  isMinAmount,
} from 'src/shared/validators';
import { WalletsProvider } from 'src/app/providers/data/wallets.provider';
import { BalancePipe } from 'src/app/pipes/balance.pipe';
import {
  SwapPair,
  SwapConvertRequestParams,
  SwapTransaction,
  SwapConvertResponse,
} from 'src/app/interface/swap';
import { SingleSwapService } from 'src/app/services/swap/single-swap.service';
import {
  pairWallet,
  findSwapFor,
  getSwapPair,
  getCurrencyNetwork,
} from 'src/app/services/swap/utils';
import { Settings } from 'src/app/interface/settings';
import { SwapProvider } from 'src/app/providers/data/swap.provider';
import { SioSwapValueComponent } from 'src/app/components/form/sio-swap-value/sio-swap-value.component';
import { environment } from '../../../../environments/environment';
import {
  SwapWalletModal,
  SwapWalletModalResponse,
} from '../../modals/swap-wallet-modal/swap-wallet.modal';
import { IoService } from 'src/app/services/io.service';
import { RateService } from 'src/app/services/apiv2/connection/rate.service';
import { Feev2Service } from 'src/app/services/apiv2/connection/feev2.service';
import { NetworkService } from 'src/app/services/apiv2/connection/network.service';
import { TxcoinService } from 'src/app/services/apiv2/transaction/txcoin.service';
import { AbiService } from 'src/app/services/apiv2/connection/abi.service';
import { SioNumpadComponent } from 'src/app/components/form/sio-numpad/sio-numpad.component';
import { SwapListModal } from '../../modals/swap-list-modal/swap-list.modal';
import { CoinsService } from 'src/app/services/apiv2/connection/coins.service';
import { CoinItem } from 'src/assets/json/coinlist';
import { coinNames } from '@simplio/backend/api/utils/coins';
import { findWallet, getPrice } from 'src/app/services/wallets/utils';

enum WalletTypes {
  source = 'sourceWallet',
  destination = 'destinationWallet',
}

type RouteData = {
  wallets: WalletsData;
  pairs: SwapPair[];
};

type SwapCoin = { from: string; to: string; fromChain?: string; toChain?: string };

@Component({
  selector: 'app-create',
  templateUrl: './exchange.page.html',
  styleUrls: ['./exchange.page.scss'],
})
export class ExchangePage implements OnInit, AfterViewInit, OnDestroy {
  disabledSwapPair = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private ioService: IoService,
    private route: ActivatedRoute,
    private txcoin: TxcoinService,
    private abiService: AbiService,
    private feeService: Feev2Service,
    private dataService: DataService,
    private rateService: RateService,
    private utilsService: UtilsService,
    private coinsService: CoinsService,
    private modalCtrl: ModalController,
    private swapProvider: SwapProvider,
    private walletService: WalletService,
    private singleSwap: SingleSwapService,
    private networkService: NetworkService,
    private txService: TransactionsService,
    private walletsProvider: WalletsProvider,
    private settingsProvider: SettingsProvider,
    private authProvider: AuthenticationProvider,
    public loadingController: LoadingController,
    private translateService: TranslateService,
    public $: Translate,
  ) {}

  get convertedAmount(): number {
    const res = this.formField.get('swapResponse').value;
    if (!res) return 0;
    const { TargetGuaranteedWithdrawalAmount: t = 0 } = res;
    return t > 0 ? t : 0;
  }

  get currentErrorMsg(): string {
    return this.formField.errors?.msg || '';
  }

  get isLoading(): boolean {
    return this._swapList === null;
  }

  get currency(): string {
    return this._settings?.currency || 'usd';
  }

  get locale(): string {
    return this._settings?.language || 'en';
  }

  get sourceWallet(): Wallet | null {
    return this.formField.get(WalletTypes.source).value || null;
  }

  get destinationWallet(): Wallet | null {
    return this.formField.get(WalletTypes.destination).value || null;
  }

  get feeLevelName(): FeeName {
    return this._settings?.feePolicy;
  }

  get currentSwapPair(): SwapPair {
    return (
      this._swapList.find(
        p =>
          p.SourceCurrency === this.sourceWallet.ticker &&
          p.SourceCurrencyNetwork ===
            getCurrencyNetwork(this.sourceWallet.type, this.sourceWallet.ticker) &&
          p.TargetCurrency === this.destinationWallet.ticker &&
          p.TargetCurrencyNetwork ===
            getCurrencyNetwork(this.destinationWallet.type, this.destinationWallet.ticker),
      ) || null
    );
  }
  readonly numTypes = SioNumpadComponent.TYPES;
  coins: CoinItem[] = [];
  coins$ = this.coinsService.coinsData$.pipe(tap(walletData => (this.coins = walletData)));
  inputAmount: string[] = [];
  private _originUrl = this.router.getCurrentNavigation().extras.state?.origin || '/home/wallets';
  loading: any;
  // routeDataSubscription$ = this.route.data.pipe(filter(d => !!d));

  walletsSubscription$ = this.walletsProvider.wallets$.pipe(filter(w => !!w));
  swapDataSubscription$ = this.swapProvider.swapData$;

  w$ = combineLatest([this.walletsSubscription$]).pipe(
    map(([w]) => {
      this._onWalletSubscription(w);
    }),
  );

  s$ = combineLatest([this.swapDataSubscription$]).pipe(
    map(([s]) => {
      this._onSwapDataSubscription(s);
    }),
  );

  settingsSubscription: Subscription;
  rateSubscription: Subscription;
  feeSubscription: Subscription;
  swapCredentialsSubscription: Subscription;

  selectError: string | null = null;
  isPending = false;
  isMax = false;
  unsignedTransaction: UnsignedTransaction<SignedTransaction> | null = null;

  private _swapData: { wallet: Wallet; pair: [Wallet, Wallet]; amount: number };
  private _settings: Settings;
  private _primaryWallet: Wallet = null;
  private _wallets: Wallet[];
  private _rates: Rate[] = [];
  private _swapList: SwapPair[] | null = null;
  private _sourceWallet: Wallet;
  private _destinationWallet: Wallet;
  private _feeEstimated;
  private _utxoData;
  private _subscription = new Subscription();

  formField: FormGroup = this.fb.group(
    {
      sourceWallet: [null, [Validators.required]],
      destinationWallet: [null, [Validators.required]],
      feeWallet: [null, [Validators.required]],
      amount: [0, [Validators.required]],
      fee: [0, [Validators.required]],
      swapResponse: [null, [Validators.required]],
      destinationFiatValue: [0, [Validators.required]],
      sourceFiatValue: [0, [Validators.required]],
    },
    {
      validators: [
        isAmountValid,
        isDestinationFiatAmountValid({
          isZeroMsg: this.$.instant(this.$.DESTINATION_FIAT_AMOUNT_MUST_BE_LARGER_THAN_ZERO),
        }),
        hasBudgetSwap({
          errMsg: this.$.instant(this.$.YOU_DONT_HAVE_ENOUGH_RESOURCES),
          convert: false,
        }),
        isMinAmount({
          isZeroMsg: this.$.instant(this.$.AMOUNT_MUST_BE_LARGER_THAN_ZERO),
          isInsufficientMsg: this.$.instant(this.$.MINIMAL_ALLOWED_AMOUNT_IS),
          errMsg: this.$.instant(this.$.YOU_DONT_HAVE_ENOUGH_RESOURCES),
          swapFeeErrMsg: this.$.instant(this.$.SWAP_FEE_ERR_MSG),
        }),
      ],
    },
  );

  @ViewChild(SioSwapValueComponent) valueComponent: SioSwapValueComponent;

  /**
   *  Retrieve available swap pairs with a preferred wallet
   *  ---
   *  It takes a available swap pairs, users wallets
   *  and optionally a users preferred wallet (primary wallet or overview wallet)
   *  and finds its possible swaps.
   */
  private static getSwapPair(
    wallets: Wallet[] = [],
    list: SwapPair[] = [],
    initWallet: Wallet = null,
  ): [Wallet, Wallet] {
    // In case of a initial wallet has been provided e.g a primary wallet or an overview wallet
    // Try to math its destination wallet first
    if (initWallet) {
      const pairedWallets = pairWallet(initWallet, wallets, list);
      if (pairedWallets.length) return [initWallet, pairedWallets[0]];
    }

    // Else try to match any wallet from provided wallets and a allowed swap pairs
    // If no pair is found throw an error object with a message prop
    try {
      const findSwap = findSwapFor(wallets, list);
      return findSwap(pairWallet)();
    } catch (err) {
      throw err;
    }
  }
  instant = s => this.translateService.instant(s);

  ngOnInit() {
    this._swapData = this.swapProvider.swapData$.value;

    const routeDataSubscription = this.route.data
      .pipe(filter(d => !!d))
      .subscribe(this._onRouteDataSubscription.bind(this));
    const settingsSubscription = this.settingsProvider.settings$
      .pipe(filter(s => !!s))
      .subscribe(this._onSettingsSubscription.bind(this));
    const rateSubscription = this.rateService.rate$
      .pipe(filter(r => !!r))
      .subscribe(this._onRateSubscription.bind(this));
    this.formField.valueChanges
      .pipe(
        map(v => v.amount),
        distinctUntilChanged<number>((a, b) => {
          return a === b;
        }),
        map(v => {
          if (this.isPending) {
            return of(this.inputAmount.push(v.toString()));
          } else {
            this.isPending = true;
            return of(this._convert(v));
          }
        }),
      )
      .subscribe();
    this._subscription.add(this.w$.subscribe());
    this._subscription.add(this.s$.subscribe());
    this._subscription.add(routeDataSubscription);
    this._subscription.add(settingsSubscription);
    this._subscription.add(rateSubscription);
    this._subscription.add(this.coins$.subscribe());
  }

  ngAfterViewInit() {
    this.swapProvider.updateSwapStatus(false);
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }

  private _onRateSubscription(rates: Rate[]) {
    this._rates = rates;
  }

  private _onSettingsSubscription(settings: Settings) {
    this._settings = settings;
  }

  private _onSwapDataSubscription(data) {
    if (data) {
      const {
        sourceWallet,
        destinationWallet,
        amount,
      }: {
        sourceWallet: Wallet;
        destinationWallet: Wallet;
        amount: number;
      } = this.formField.value;

      let sourceWalletNew: Wallet;
      let destinationWalletNew: Wallet;
      if (data.pair && data.pair.length >= 2 && data.pair[0] && data.pair[1]) {
        [sourceWalletNew, destinationWalletNew] = data.pair;
      } else {
        [sourceWalletNew, destinationWalletNew] = ExchangePage.getSwapPair(
          this._wallets,
          this._swapList,
          data.wallet || this._primaryWallet || this._wallets.find(e => e.ticker === coinNames.BTC),
        );
      }

      if (
        data.pair.length === 0 ||
        (data.pair[0] && data.pair[0].ticker !== sourceWalletNew?.ticker) ||
        (data.pair[0] && data.pair[0].type !== sourceWalletNew?.type)
      ) {
        const sourceWalletNew2 = findWallet(this._wallets, coinNames.BTC, WalletType.BITCORE_LIB);
        const destinationWalletNew2 = findWallet(this._wallets, coinNames.SOL, WalletType.SOLANA);
        if (sourceWalletNew2 && destinationWalletNew2) {
          sourceWalletNew = sourceWalletNew2;
          destinationWalletNew = destinationWalletNew2;
        }
      }

      if (
        !sourceWallet ||
        !destinationWallet ||
        sourceWallet.ticker !== sourceWalletNew?.ticker ||
        destinationWallet.ticker !== destinationWalletNew?.ticker ||
        pipeAmount(amount, sourceWallet.ticker, sourceWallet.type, sourceWallet.decimal, false) !==
          data.amount
      ) {
        this._swapData = data;

        let amount = pipeAmount(
          data.amount,
          sourceWalletNew.ticker,
          sourceWalletNew.type,
          sourceWalletNew.decimal,
          true,
        );

        amount = parseFloat(amount.toFixed(sourceWalletNew.decimal));
        this._patchWallets(sourceWalletNew, destinationWalletNew);
        this.formField.patchValue({ fee: data.fee || 0 });
        this.setValue(amount || 0);
      }
    }
  }

  private _onRouteDataSubscription({ wallets: w, pairs: p }: RouteData) {
    this._wallets = w.wallets;
    this._primaryWallet = w.primaryWallet;
    this._swapList = p;

    this._patchWallets(this.sourceWallet, this.destinationWallet);
  }

  private _checkBalanceChange(org: Wallet[], des: Wallet[]) {
    return org?.some(e => {
      if (e.balance !== des.find(ee => ee._uuid === e._uuid).balance) {
        return true;
      }
    });
  }

  private _patchWallets(source: Wallet, des: Wallet) {
    this._sourceWallet = source;
    this._destinationWallet = des;
    this.formField.patchValue({ [WalletTypes.source]: source });
    this.formField.patchValue({ [WalletTypes.destination]: des });
  }

  private _onWalletSubscription(wallets) {
    if (
      wallets &&
      (this._wallets.length !== wallets.length ||
        this._checkBalanceChange(this._wallets, wallets) ||
        !this._sourceWallet ||
        !this._destinationWallet)
    ) {
      this._wallets = [...wallets];
      const [sourceWallet, destinationWallet] = ExchangePage.getSwapPair(
        this._wallets,
        this._swapList,
        this._swapData?.wallet || this._primaryWallet,
      );
      this._patchWallets(sourceWallet, destinationWallet);
    }
  }

  private async _estimateSwap(data: SwapConvertRequestParams) {
    try {
      if (data.SourceAmount > 0) {
        const convertRes = await this.singleSwap.convert(data);
        this.formField.patchValue({
          swapResponse: convertRes,
          sourceFiatValue: getPrice(this._rates, data.SourceCurrency, 'USD'),
          destinationFiatValue: getPrice(this._rates, data.TargetCurrency, 'USD'),
        });
      } else {
        this._cleanData();
        throw new Error(this.$.YOU_DONT_HAVE_ENOUGH_RESOURCES);
      }
      if (UtilsService.isToken(this.sourceWallet.type)) {
        const {
          feeWallet,
          fee,
        }: {
          feeWallet: Wallet;
          fee: number;
        } = this.formField.value;

        const balance = feeWallet.balance;
        if (fee > balance) {
          const tf = (n: number, s: string, t: WalletType, d: number) =>
            BalancePipe.prototype.transform(n, s, t, d);

          let chainMsg = '';
          switch (feeWallet.type) {
            case WalletType.ETH:
              chainMsg = 'ETH';
              break;
            case WalletType.BSC:
              chainMsg = 'BNB (Smart Chain)';
              break;
            case WalletType.SOLANA:
              chainMsg = 'SOL';
              break;
            default:
              throw new Error(`Cannot get data for sending`);
          }
          throw new Error(
            `Insufficient amount, you need more ${chainMsg} in address ${
              feeWallet.mainAddress
            } for the fee or decrease fee level, current balance ${tf(
              balance,
              feeWallet.ticker,
              feeWallet.type,
              feeWallet.decimal,
            )} , expected balance ${tf(fee, feeWallet.ticker, feeWallet.type, feeWallet.decimal)}`,
          );
        }
      }
    } catch (err) {
      let errMsg;
      if (err.error?.errors) {
        const { SourceAmount: sErrs } = err.error.errors;
        errMsg = sErrs[sErrs.length - 1] || this.$.instant(this.$.CONVERTING_VALUE_HAS_FAILED);
        // await this.utilsService.showToast(errMsg, 1500, 'warning');
      } else {
        errMsg = this.$.instant(err.message);
        // await this.utilsService.showToast(errMsg, 1500, 'warning');
      }
      throw new Error(errMsg);
    } finally {
      if (this.inputAmount.length > 0) {
        const lastAmount = this.inputAmount.pop();
        this.inputAmount = [];
        this._feeEstimated = undefined;
        return this._convert(lastAmount).then(_ => (this.isPending = false));
      } else {
        this.isPending = false;
      }
    }
  }

  private _cleanData() {
    this.formField.patchValue({ swapResponse: null });
    this.formField.patchValue({ feeWallet: null });
    this.formField.patchValue({ amount: 0 });
    this.isPending = false;
    this._feeEstimated = undefined;
    this.inputAmount = [];
  }

  setValue(value) {
    if (!this.valueComponent) {
      setTimeout(() => {
        this.setValue(value);
      });
    } else {
      this.valueComponent.updateInputValueFinal(value);
      if (value > 0) {
        this.isPending = true;
      }
      this._convert(value);
    }
  }

  /**
   *  Converting a coin value
   *  ---
   *  first we check if the value is zero. If so we don't have to run conversion
   *  the method returns 0.
   *  In other case if a value is provided we run a api call via a swap service.
   *  The returned value we assign to a public variable that is passed to
   *  the `sio-value-swap-component` that renders it.
   */
  private async _convert(value): Promise<any> {
    // Checking if the value is zero
    // If so it return a resolved promise with value of zero
    if (value === 0 || value === '0') {
      this._cleanData();
      return 0;
    }

    if (!this._feeEstimated) {
      try {
        await this.noUtxoCheck();
        const abi = this.ioService.getAbi(
          this.sourceWallet.contractaddress,
          this.sourceWallet.type,
        );
        if (UtilsService.isErcToken(this.sourceWallet.type) && !abi?.length) {
          const abiData = {
            contractaddress: this.sourceWallet.contractaddress,
            type: this.sourceWallet.type,
            abi: await this.abiService.getAbi({
              ticker: this.sourceWallet.ticker,
              type: this.sourceWallet.type,
              contractAddress: this.sourceWallet.contractaddress,
            }),
          };
          await this.ioService.addAbi(abiData);
        }
        const selectedSwapPair = getSwapPair(
          this._swapList,
          this.sourceWallet.ticker,
          getCurrencyNetwork(this.sourceWallet.type, this.sourceWallet.ticker),
          this.destinationWallet.ticker,
          getCurrencyNetwork(this.destinationWallet.type, this.destinationWallet.ticker),
        );
        const feePrice = await this.feeService.getFeePrice(
          this.sourceWallet.ticker,
          this.sourceWallet.type,
          this.feeLevelName,
        );
        const minFee = this.feeService.getMinFee(this.sourceWallet.ticker);
        this._feeEstimated = await this.feeService.estimatedFee({
          ticker: this.sourceWallet.ticker,
          type: this.sourceWallet.type,
          ismax: this.isMax,
          address: selectedSwapPair.SourceDepositAddress,
          amount: pipeAmount(
            value,
            this.sourceWallet.ticker,
            this.sourceWallet.type,
            this.sourceWallet.decimal,
          ),
          from: this.sourceWallet.mainAddress,
          feePrice,
          minFee,
          utxos: this._utxoData?.utxos,
          abi,
          contractAddress: this.sourceWallet.contractaddress,
          api: this.sourceWallet.api,
          signature: 1,
        });

        this._patchFeeWallet();
        this.formField.patchValue({ fee: this._feeEstimated.fees });
      } catch (err) {
        // this.utilsService.showToast(err.message, 3000, 'warning');
        // this.isPending = false;
        // throw err;
      }
    }

    const convertRequest: SwapConvertRequestParams = {
      SourceAmount: value,
      SourceCurrency: this.sourceWallet.ticker,
      SourceCurrencyNetwork: this.currentSwapPair.SourceCurrencyNetwork,
      TargetCurrency: this.destinationWallet.ticker,
      TargetCurrencyNetwork: this.currentSwapPair.TargetCurrencyNetwork,
    };

    try {
      this._swapData.amount = convertRequest.SourceAmount;
      // this.formField.patchValue({ amount: convertRequest.SourceAmount || 0 });
      await this._estimateSwap(convertRequest);
    } catch (ex) {
      this.isPending = false;
      return this.utilsService.showToast(ex.message, 5000, 'warning');
    }
  }

  /**
   *  Registering a users address
   *  ---
   *  To be able to proceed a swap, a user has to have
   *  his wallet registered on the api side.
   */
  private _registerWallet(wallet: Wallet): Promise<any> {
    return this.singleSwap.registerWallet(wallet);
  }

  async openSwapWalletModal() {
    console.log('Opening swap wallet modal');
    const modal = await this._presentModal(SwapWalletModal, {
      source: this.sourceWallet,
      destination: this.destinationWallet,
      rates: this._rates,
      currency: this.currency,
      wallets: this._wallets,
      list: this._swapList.filter(
        (value, index, self) =>
          self.findIndex(
            e =>
              e.TargetCurrency === value.TargetCurrency &&
              e.TargetCurrencyNetwork === value.TargetCurrencyNetwork &&
              e.SourceCurrency === value.SourceCurrency &&
              e.SourceCurrencyNetwork === value.SourceCurrencyNetwork,
          ) === index,
      ),
    });

    modal
      .onWillDismiss()
      .then(({ data }: { data: SwapWalletModalResponse }) => {
        if (data === undefined) return { s: null, d: null }; // do nothing if going back by gesture
        if (!data.isValid) throw new Error('Wallet has not been set');
        // if (data.sourceWallet.balance === 0) this.utilsService.showToast('Could not find any UTXO to spend', 3000, 'warning');

        const oldSource = this.sourceWallet;
        const oldDestination = this.destinationWallet;
        if (!!this._swapData) {
          if (!this._swapData.wallet) {
            this._swapData.wallet = data.sourceWallet;
          }
        }
        return {
          s: data.sourceWallet,
          d: data.destinationWallet,
          os: oldSource,
          od: oldDestination,
        };
      })
      .then(({ s = null, d = null, os = null, od = null }) => {
        if (s !== null && d !== null && (s !== os || d !== od)) {
          this._swapData.pair = [s, d];
          this._swapData.amount = 0;
          this._swapData.wallet = s;
          this.formField.setValue({
            [WalletTypes.source]: s,
            [WalletTypes.destination]: d,
            amount: 0,
            fee: 0,
            feeWallet: null,
            swapResponse: null,
            destinationFiatValue: 0,
            sourceFiatValue: 0,
          });
          this.setValue(0);
        }

        this.swapProvider.pushSwapData({
          wallet: this._swapData.wallet,
          pair: [s, d],
          amount: pipeAmount(
            this._swapData.amount,
            this._swapData.wallet.ticker,
            this._swapData.wallet.type,
            this._swapData.wallet.decimal,
          ),
        });
      })
      .then(() => this.checkDisabledSwapPair())
      .catch((err: Error) => this.utilsService.showToast(err.message, 1500, 'warning'));
  }

  async openSwapListModal() {
    const list = this._swapList.filter(l => l.IsEnabled);
    await this._presentModal(SwapListModal, { list, coins: this.coins });
  }

  /**
   *  Presenting modal
   *  ---
   *  a general method for presenting modal
   *  with custom props
   */
  private _presentModal(modal, props = {}): Promise<HTMLIonModalElement> {
    return this.modalCtrl
      .create({
        component: modal,
        componentProps: props,
      })
      .then(m => m.present().then(() => m));
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

  onAmountChange(value: number) {
    this._feeEstimated = undefined;
    this.valueComponent.updateInputValue(value);

    this.checkDisabledSwapPair();
  }

  async onMaxClick(_event) {
    this.checkDisabledSwapPair();
    if (!this.isMax) {
      this.isMax = true;
      await this.presentLoading(this.$.CALCULATING);
      await this.noUtxoCheck();
      const feePrice = await this.feeService.getFeePrice(
        this.sourceWallet.ticker,
        this.sourceWallet.type,
        this.feeLevelName,
      );
      const minFee = this.feeService.getMinFee(this.sourceWallet.ticker);
      const selectedSwapPair = getSwapPair(
        this._swapList,
        this.sourceWallet.ticker,
        getCurrencyNetwork(this.sourceWallet.type, this.sourceWallet.ticker),
        this.destinationWallet.ticker,
        getCurrencyNetwork(this.destinationWallet.type, this.destinationWallet.ticker),
      );
      this.feeService
        .estimatedFee({
          ticker: this.sourceWallet.ticker,
          type: this.sourceWallet.type,
          ismax: this.isMax,
          address: selectedSwapPair.SourceDepositAddress,
          amount: this.sourceWallet.balance,
          from: this.sourceWallet.mainAddress,
          feePrice,
          minFee,
          utxos: this._utxoData?.utxos,
          abi: this.ioService.getAbi(this.sourceWallet.contractaddress, this.sourceWallet.type),
          contractAddress: this.sourceWallet.contractaddress,
          api: this.sourceWallet.api,
          signature: 1,
        })
        .then(res => {
          this.dismissLoading();
          this.isMax = false;
          this._feeEstimated = res;
          this._patchFeeWallet();
          this.formField.patchValue({ fee: res.fees });
          this.valueComponent?.updateInputValueFinal(
            pipeAmount(
              res.amount < 0 ? 0 : res.amount,
              this.sourceWallet.ticker,
              this.sourceWallet.type,
              this.sourceWallet.decimal,
              true,
            ) || 0,
          );
        })
        .catch(err => {
          this.isMax = false;
          this.dismissLoading();
          this.utilsService.showToast(err.message, 5000, 'warning');
        });
    }
  }

  /**
   *  Signing up a swap transaction
   *  ---
   *  getting a signature via api and assigning it to a swap transaction.
   *  A method returns a new swap transaction inside a promise object.
   */
  private async _signingSwap(
    swapTransaction: SwapTransaction<SignedTransaction>,
    account: Acc,
  ): Promise<SwapTransaction<SignedTransaction>> {
    const swapTx: SwapTransaction<SignedTransaction> = cloneDeep(swapTransaction);

    const { ticker, type, mnemo, decimal } = swapTx.source.wallet;

    swapTx.feepipe = {
      ticker,
      type,
      decimal,
    };

    switch (type) {
      case WalletType.BSC_TOKEN:
        swapTx.feepipe = {
          ticker: coinNames.BNB,
          type: WalletType.BSC,
          decimal: 18,
        };
        break;
      case WalletType.SOLANA_TOKEN:
      case WalletType.SOLANA_TOKEN_DEV:
        swapTx.feepipe = {
          ticker: coinNames.SOL,
          type: WalletType.SOLANA,
          decimal: 9,
        };
        break;
      case WalletType.ETH_TOKEN:
        swapTx.feepipe = {
          ticker: coinNames.ETH,
          type: WalletType.ETH,
          decimal: 18,
        };
        break;
      default:
        break;
    }
    const { idt } = account;
    swapTx.source.mnemo = this.walletService.getSeeds(mnemo, idt);
    swapTx.source.explorer = this._utxoData?.explorer;
    swapTx.source.fee.price = await this.feeService.getFeePrice(ticker, type, this.feeLevelName);
    swapTx.source.fee.minFee = this.feeService.getMinFee(ticker);
    swapTx.signature = {
      fee: this._feeEstimated.fees,
      amount: this._feeEstimated.amount,
      utxo: this._feeEstimated.utxoToUse,
      change: this._feeEstimated.change,
      gasLimit: this._feeEstimated.gasLimit,
      gasPrice: this._feeEstimated.gasPrice,
    };

    return swapTx;
  }

  /**
   *  Submitting form
   *  ---
   *  retrieving data from a reactive form and running a sign fn.
   *  If signing was successful, it navigates to the summary page
   *  else it shows a error message to the user.
   */
  async onSubmit() {
    const account = this.authProvider.accountValue;
    const loading = await this.loadingController.create();
    await loading.present();

    const {
      sourceWallet,
      destinationWallet,
      swapResponse,
    }: {
      sourceWallet: Wallet;
      destinationWallet: Wallet;
      swapResponse: SwapConvertResponse;
    } = this.formField.value;

    const selectedSwapPair = getSwapPair(
      this._swapList,
      this.sourceWallet.ticker,
      getCurrencyNetwork(this.sourceWallet.type, this.sourceWallet.ticker),
      this.destinationWallet.ticker,
      getCurrencyNetwork(this.destinationWallet.type, this.destinationWallet.ticker),
    );

    const swapTxScaffold: SwapTransaction<SignedTransaction> = {
      source: {
        wallet: sourceWallet,
        mnemo: '',
        fee: {
          name: this.feeLevelName,
          minFee: 0,
          value: 0,
          price: 0,
          ticker: '',
          type: WalletType.UNKNOWN,
        },
        utxo: [],
        explorer: undefined,
      },
      feepipe: {
        ticker: '',
        type: 0,
        decimal: 8,
      },
      target: {
        wallet: destinationWallet,
        depositAddress: selectedSwapPair.SourceDepositAddress,
      },
      pair: selectedSwapPair,
      swap: swapResponse,
    };

    // Chaining async methods:
    // 1. register wallet for a swap transaction
    // 2. sign the transaction
    Promise.all([
      this._registerWallet(swapTxScaffold.source.wallet),
      this._signingSwap(swapTxScaffold, account),
    ])
      .then(all => {
        this.dataService.setSwapTransaction(all[1]);
      })
      .then(() => {
        this.swapProvider.pushSwapData({
          wallet: this._swapData.wallet,
          pair: this._swapData.pair,
          amount: pipeAmount(
            swapResponse.SourceCurrentAmount,
            swapTxScaffold.source.wallet.ticker,
            swapTxScaffold.source.wallet.type,
            swapTxScaffold.source.wallet.decimal,
          ),
        });
        this.router.navigate(['summary'], { relativeTo: this.route });
      })
      .catch(err => {
        console.log(err);
        let errMsg = '';
        if (err.error && err.error.errors && isObject(err.error.errors)) {
          errMsg = JSON.stringify(err.error.errors);
        } else {
          errMsg = err.message;
        }
        if (errMsg.includes('Adding address has failed')) {
          this.utilsService.showToast(
            this.instant(this.$.ADDING_ADDRESS_HAS_FAILED),
            3000,
            'warning',
          );
        } else if (errMsg.includes('Connection issue')) {
          this.utilsService.showToast(
            this.instant(this.$.CANNOT_CONNECT_TO_SWAP_SERVER),
            3000,
            'warning',
          );
        } else {
          this.utilsService.showToast(err.message, 3000, 'warning');
        }
      })
      .then(() => {
        loading.dismiss();
      });
  }

  back() {
    this.router.navigateByUrl(this._originUrl);
  }

  private async noUtxo(): Promise<void> {
    // return this.utilsService.showToast('Could not find any UTXO to spend', 3000, 'warning');
  }

  private async noUtxoCheck() {
    if (UtilsService.isCoin(this.sourceWallet.type)) {
      let explorers = this.networkService.getCoinExplorers(
        this.sourceWallet.ticker,
        this.sourceWallet.type,
      );
      explorers = explorers.filter(e => e.type === explorers[0].type);
      this._utxoData = await this.txcoin.getUtxo({
        explorers,
        addresses: this.sourceWallet.addresses.map(a => a.address),
      });

      if (this._utxoData.utxos.length === 0) await this.noUtxo();
    }
  }

  private _patchFeeWallet() {
    let mainWallet = this.sourceWallet;
    if (UtilsService.isToken(this.sourceWallet.type)) {
      switch (this.sourceWallet.type) {
        case WalletType.ETH_TOKEN:
        default:
          mainWallet = this.ioService
            .getAllWallets()
            .find(
              e =>
                e.mainAddress === this.sourceWallet.mainAddress &&
                e.ticker.toUpperCase() === coinNames.ETH,
            );
          break;
        case WalletType.BSC_TOKEN:
          mainWallet = this.ioService
            .getAllWallets()
            .find(
              e =>
                e.mainAddress === this.sourceWallet.mainAddress &&
                e.ticker.toUpperCase() === coinNames.BNB,
            );
          break;
        case WalletType.SOLANA_TOKEN:
        case WalletType.SOLANA_TOKEN_DEV:
          mainWallet = this.ioService
            .getAllWallets()
            .find(
              e =>
                e.mainAddress === this.sourceWallet.mainAddress &&
                e.ticker.toUpperCase() === coinNames.SOL,
            );
      }
    }
    this.formField.patchValue({ feeWallet: mainWallet });
  }

  private checkDisabledSwapPair() {
    const disabledPairs: SwapCoin[] = environment.CUSTOM_CONTENT.DISABLED_SWAP_PAIRS
      ? [
          { from: coinNames.BUSD, to: coinNames.BNB },
          { from: coinNames.BUSD, to: coinNames.ZEC },
          { from: coinNames.USDC, fromChain: coinNames.BSC, to: coinNames.BNB },
          { from: coinNames.BUSD, to: coinNames.SOL },
          { from: coinNames.LTC, to: coinNames.USDC, toChain: coinNames.BSC },
          { from: coinNames.ETH, to: coinNames.USDT, toChain: coinNames.BSC },
        ]
      : [];

    const fromChainTicker = getChainId(this.sourceWallet);
    const toChainTicker = getChainId(this.destinationWallet);

    const fromChainCondition = (pair: SwapCoin) => {
      if (!pair.fromChain) return true;

      return pair.fromChain === fromChainTicker || pair.fromChain === toChainTicker;
    };

    const toChainCondition = (pair: SwapCoin) => {
      if (!pair.toChain) return true;

      return pair.toChain === fromChainTicker || pair.toChain === toChainTicker;
    };

    const result = disabledPairs.some(
      pair =>
        (pair.from === this.sourceWallet.ticker || pair.to === this.sourceWallet.ticker) &&
        (pair.from === this.destinationWallet.ticker ||
          pair.to === this.destinationWallet.ticker) &&
        fromChainCondition(pair) &&
        toChainCondition(pair),
    );

    if (result) {
      this.utilsService.showToast(
        'This swap pair is temporary disabled. Please try it again later.',
        3000,
        'warning',
      );
    }

    this.disabledSwapPair = result;
  }
}
