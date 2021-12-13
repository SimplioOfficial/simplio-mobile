import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Subscription, interval, Subject, NEVER, of, from } from 'rxjs';
import {
  switchMap,
  startWith,
  scan,
  tap,
  takeWhile,
  retryWhen,
  delay,
  shareReplay,
  catchError,
} from 'rxjs/operators';
import { AlertController, LoadingController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { cloneDeep } from 'lodash';

import { DataService } from 'src/app/services/data.service';
import { Rate, SignedTransaction, Wallet } from 'src/app/interface/data';
import { pipeAmount, UtilsService } from 'src/app/services/utils.service';
import { Translate } from 'src/app/providers/translate';
import {
  SwapTransaction,
  SwapConvertResponse,
  SwapConvertRequestParams,
  SwapSingleResponse,
} from 'src/app/interface/swap';
import { SingleSwapService } from 'src/app/services/swap/single-swap.service';
import { WalletsProvider } from 'src/app/providers/data/wallets.provider';
import { MultiFactorAuthenticationService } from 'src/app/services/authentication/mfa.service';
import { CheckWalletsService } from 'src/app/services/wallets/check-wallets.service';
import { RateService } from 'src/app/services/apiv2/connection/rate.service';
import { IoService } from 'src/app/services/io.service';
import { getCurrencyNetwork } from 'src/app/services/swap/utils';
import { getPrice } from '../../../services/wallets/utils';
import { Feev2Service } from '../../../services/apiv2/connection/feev2.service';
import { SettingsProvider } from '../../../providers/data/settings.provider';
import { TxcoinService } from '../../../services/apiv2/transaction/txcoin.service';
import { NetworkService } from '../../../services/apiv2/connection/network.service';
import { BackendService } from 'src/app/services/apiv2/blockchain/backend.service';

@Component({
  selector: 'swap-summary-page',
  templateUrl: './swap-summary.page.html',
  styleUrls: ['./swap-summary.page.scss'],
})
export class SwapSummaryPage implements OnInit, OnDestroy {
  swapTxSubscription: Subscription;
  swapRetryResponseSubscription: Subscription;

  swapTx: SwapTransaction<SignedTransaction> = null;
  loading: HTMLIonLoadingElement;
  referenceCode = '';
  canProceed = false;
  expanded = false;

  feeEstimated;

  readonly refreshTime = 10;
  private readonly refreshCounter = new Subject<{ pause?: boolean; counter?: number }>();
  private _referenceCodeOriginal = '';
  private rate: Rate[] = [];
  private feeLevelName;

  constructor(
    private io: IoService,
    private router: Router,
    private utils: UtilsService,
    private ts: TranslateService,
    private ioService: IoService,
    private route: ActivatedRoute,
    private txcoin: TxcoinService,
    private feeService: Feev2Service,
    private rateService: RateService,
    private dataService: DataService,
    private utilsService: UtilsService,
    private checker: CheckWalletsService,
    private singleSwap: SingleSwapService,
    private networkService: NetworkService,
    private loadingCtrl: LoadingController,
    private walletsProvider: WalletsProvider,
    private alertController: AlertController,
    private settingsProvider: SettingsProvider,
    private backendService: BackendService,
    private mfa: MultiFactorAuthenticationService,
    public $: Translate,
  ) {
    this.feeLevelName = this.settingsProvider.settingsValue.feePolicy;
  }

  get targetEstimatedWithdrawalAmount() {
    return parseFloat(
      this.swapTx.swap.TargetEstimatedWithdrawalAmount.toFixed(
        this.swapTx.target.wallet.decimal ||
          UtilsService.getDecimals(
            this.swapTx.target.wallet.type,
            this.swapTx.target.wallet.ticker,
          ),
      ),
    );
  }

  get targetGuaranteedWithdrawalAmount() {
    return parseFloat(
      this.swapTx.swap.TargetGuaranteedWithdrawalAmount.toFixed(
        Math.min(
          this.swapTx.target.wallet.decimal ||
            UtilsService.getDecimals(
              this.swapTx.target.wallet.type,
              this.swapTx.target.wallet.ticker,
            ),
          8,
        ),
      ),
    );
  }

  get targetPrice() {
    const price =
      this.swapTx.swap.SourceCurrentAmount / this.swapTx.swap.TargetEstimatedWithdrawalAmount;
    return parseFloat(
      price.toFixed(
        Math.min(
          this.swapTx.target.wallet.decimal ||
            UtilsService.getDecimals(
              this.swapTx.target.wallet.type,
              this.swapTx.target.wallet.ticker,
            ),
          8,
        ),
      ),
    );
  }

  get sourceNetwork(): string {
    return getCurrencyNetwork(this.swapTx.source.wallet.type, this.swapTx.source.wallet.ticker);
  }

  get targetNetwork(): string {
    return getCurrencyNetwork(this.swapTx.target.wallet.type, this.swapTx.target.wallet.ticker);
  }

  get sourceCoin(): string {
    return this.swapTx?.source.wallet.ticker;
  }

  get targetCoin(): string {
    return this.swapTx?.target.wallet.ticker;
  }

  get withdrawalFee() {
    return this.swapTx.swap.TargetWithdrawalFee;
  }

  get withdrawalFeeFiat() {
    return this.withdrawalFee * this.getPrice(this.swapTx.target.wallet.ticker, 'USD');
  }

  get transactionFee() {
    return pipeAmount(
      this.swapTx.signature.fee,
      this.swapTx.feepipe.ticker,
      this.swapTx.feepipe.type,
      this.swapTx.feepipe.decimal,
      true,
    );
  }

  get transactionFeeTicker() {
    return this.swapTx.feepipe.ticker;
  }

  get transactionFeeFiat() {
    return this.transactionFee * this.getPrice(this.swapTx.feepipe.ticker, 'USD');
  }

  get transactionFeeToSource() {
    return (
      (this.transactionFee * this.getPrice(this.swapTx.feepipe.ticker, 'USD')) /
      this.getPrice(this.swapTx.source.wallet.ticker, 'USD')
    );
  }

  get withdrawalFeeToSource() {
    return (
      (this.swapTx.swap.TargetWithdrawalFee *
        this.getPrice(this.swapTx.target.wallet.ticker, 'USD')) /
      this.getPrice(this.swapTx.source.wallet.ticker, 'USD')
    );
  }

  get swapFee() {
    return this.swapTx.swap.TotalSwapFee;
  }

  get swapFeeFiat() {
    return this.swapFee * this.getPrice(this.swapTx.source.wallet.ticker, 'USD');
  }

  get sourceAmount() {
    return pipeAmount(
      this.swapTx.signature.amount,
      this.swapTx.source.wallet.ticker,
      this.swapTx.source.wallet.type,
      this.swapTx.source.wallet.decimal,
      true,
    );
  }

  get sourceFiat() {
    return this.sourceAmount * this.getPrice(this.swapTx.source.wallet.ticker, 'USD');
  }

  get targetFiat() {
    return (
      this.targetEstimatedWithdrawalAmount * this.getPrice(this.swapTx.target.wallet.ticker, 'USD')
    );
  }

  get totalFee() {
    return this.withdrawalFeeToSource + this.transactionFeeToSource + this.swapFee;
  }

  get totalFeeFiat() {
    return this.totalFee * this.getPrice(this.swapTx.source.wallet.ticker, 'USD');
  }

  ngOnInit() {
    this.swapTxSubscription = this.dataService.swapTransaction.subscribe(swap => {
      if (!swap) return;
      this.swapTx = swap;
      console.log(this.swapTx);
      this._initCounter();
    });

    this.rate = this.rateService.rateValue;

    console.log(212, this.getPrice('USD', 'EUR'));
  }

  ngOnDestroy() {
    this.swapTxSubscription.unsubscribe();
    this.refreshCounter.unsubscribe();
    if (this.swapRetryResponseSubscription) this.swapRetryResponseSubscription.unsubscribe();
  }

  /**
   *  Proceed swap transaction
   *  ---
   *  Goal is to update transaction's values
   *  if it reaches an age of more than 10 seconds.
   *
   *  The counter can be stopped / paused when the reference code
   *  is inserting. After that the counter continues.
   *
   */
  private _initCounter() {
    this.refreshCounter
      .pipe(
        startWith({ pause: false, counter: 0 }),
        scan((acc, curr) => ({ ...acc, ...curr })),
        tap(() => {
          this.canProceed = true;
        }),
        switchMap(state =>
          state.pause
            ? NEVER
            : interval(1000).pipe(
                takeWhile(() => {
                  if (state.counter === this.refreshTime) {
                    this.canProceed = false;
                  }
                  if (state.counter < this.refreshTime + 1) {
                    state.counter++;
                  }
                  return state.counter < this.refreshTime + 1;
                }),
              ),
        ),
      )
      .subscribe();
  }

  private _pauseCounter(pause) {
    this.refreshCounter.next({ pause });
  }

  private _resetCounter() {
    this.refreshCounter.next({ pause: false, counter: 0 });
  }

  async presentUpdateAlert() {
    const alert = await this.utils.createAlert({
      header: this.$.UPDATE_PRICE,
      message: [
        this.$.CRYPTO_PRICES_CHANGE_FAST,
        this.swapTx.source.wallet.ticker,
        'to',
        this.swapTx.target.wallet.ticker,
      ],
      buttons: [
        {
          text: this.$.CANCEL,
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          },
        },
        {
          text: this.$.UPDATE,
          handler: () => this.update(),
        },
      ],
    });
    return alert.present();
  }

  async presentReferenceCodePrompt() {
    const alert = await this.utils.createAlert({
      header: this.$.REFERENCE_CODE,
      inputs: [
        {
          name: 'ref',
          type: 'text',
          value: this._referenceCodeOriginal,
          placeholder: this.$.CODE,
        },
      ],
      buttons: [
        {
          text: this.$.CANCEL,
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            this._pauseCounter(false);
          },
        },
        {
          text: this.$.OK,
          handler: ({ ref = '' }: { ref: string }) => {
            const r = ref.split(' ').join('').slice(0, 49).toUpperCase();
            this._referenceCodeOriginal = ref;
            this.referenceCode = r;
            this._pauseCounter(false);
          },
        },
      ],
    });
    await alert.present().then(() => {
      this._pauseCounter(true);
    });
  }

  /**
   *  Update
   *  ---
   *  If the transaction is older that 10 seconds
   *  the transaction needs to be refreshed.
   *
   */
  async update() {
    const loading = await this.loadingCtrl.create({ duration: 2000 });
    await loading.present();

    this._updateSwapAmount()
      .then(this._resetCounter.bind(this))
      .catch(err => {
        console.error(err);
        this.utilsService.showToast(this.$.UPDATING_AMOUNT_HAS_FAILED, 1000, 'warning');
      })
      .then(async () => {
        await loading.dismiss();
      });
  }

  private _updateSwapAmount(): Promise<SwapConvertResponse> {
    const convertData: SwapConvertRequestParams = {
      SourceCurrency: this.swapTx.source.wallet.ticker.toUpperCase(),
      SourceAmount: this.swapTx.swap.SourceCurrentAmount,
      SourceCurrencyNetwork: this.swapTx.pair.SourceCurrencyNetwork,
      TargetCurrency: this.swapTx.target.wallet.ticker.toUpperCase(),
      TargetCurrencyNetwork: this.swapTx.pair.TargetCurrencyNetwork,
      TargetExchangeEndpoint: this.swapTx.pair.ExchangeEndpoint,
    };

    return this.singleSwap.convert(convertData).then(res => {
      this.dataService.setSwapTransaction({
        ...this.swapTx,
        swap: res,
      });
      return res;
    });
  }

  /**
   *  Registering transaction in Exchange
   *  ---
   *
   */
  private async _registerInExchange(
    swapTransaction: SwapTransaction<SignedTransaction>,
  ): Promise<SwapTransaction<SignedTransaction>> {
    try {
      const swapTx: SwapSingleResponse = {
        sourceTxId: swapTransaction.sourceTxId,
        sourceCurrency: swapTransaction.source.wallet.ticker,
        targetCurrency: swapTransaction.target.wallet.ticker,
        targetAddress: swapTransaction.target.wallet.mainAddress,
        refundAddress: swapTransaction.source.wallet.mainAddress,
        label1: '',
        label2: '',
        label3: '',
        referenceCode: swapTransaction.referenceCode,
        sourceCurrencyNetwork: swapTransaction.pair.SourceCurrencyNetwork,
        targetCurrencyNetwork: swapTransaction.pair.TargetCurrencyNetwork,
        targetExchangeEndpoint: swapTransaction.pair.ExchangeEndpoint,
        targetPrice: swapTransaction.swap.TargetGuaranteedPrice,
        userAgreedAmount: swapTransaction.swap.TargetGuaranteedWithdrawalAmount,
        usdToEurRate: this.getPrice('USD', 'EUR'),
        sourceInitialAmount: this.sourceAmount,
        sourceInitialAmountInFiat: this.sourceFiat,
        targetInitialAmountInFiat: this.targetFiat,
        sourceTxFee: this.transactionFee,
      };
      if (swapTransaction.referenceCode) {
        swapTx.referenceCode = swapTransaction.referenceCode;
      }

      return this.singleSwap
        .swap(swapTx)
        .then(res => {
          return swapTransaction;
        })
        .catch(err => {
          throw err;
        });
    } catch (err) {
      console.error(err);
      throw new Error('Registering swap on exchanges has failed');
    }
  }

  async onSubmit() {
    const idx = this.walletsProvider.walletsValue.findIndex(e => {
      const t = e.addresses.findIndex(ee => ee.address === this.swapTx.target.wallet.mainAddress);
      if (t > -1) {
        return true;
      }
      return false;
    });

    if (idx === -1) return this.utils.showToast(this.$.SWAP_ADDRESS_NOT_INCLUDED, 5000, 'warning');
    if (!this.canProceed) return this.presentUpdateAlert();

    const modal = await this.mfa.showIdentityVerificationModal({
      fullScreen: true,
      attempts: 3,
      warnAt: 2,
    });

    const {
      data: {
        result: [isVerified],
      },
    } = await modal.onWillDismiss();

    if (isVerified) return this.onSwap();

    this.utils.showToast(this.$.INCORRECT_PIN, 3000, 'warning');
  }

  check = (w: Wallet) => {
    this.checker.checkNewTransactions(w);
  };

  /**
   *  Registering transaction in Explorer
   *  ---
   *  1. The transaction has to be registered in explorer
   *  2. The signed transaction has to be registered in exchange:
   *     In case the transaction is not been recognized in exchnage
   *     the http call will be repeated until it success
   *  3. Finally the transaction will be set in memory for saving
   *     it in local db in the next step.
   */
  async onSwap() {
    const loading: HTMLIonLoadingElement = await this.loadingCtrl.create();
    await loading.present();

    try {
      // Registering transaction in explorer
      loading.message = this.ts.instant(this.$.INITIATING_SWAP);
      const { type: wType } = this.swapTx.source.wallet;

      const txid = await this.backendService.createTransaction({
        _uuid: this.swapTx.source.wallet._uuid,
        seeds: this.swapTx.source.mnemo,
        explorer: this.swapTx.source.explorer,
        addresses: this.swapTx.source.wallet.addresses,
        ticker: this.swapTx.source.wallet.ticker,
        type: wType,
        // receiver: this.swapTx.source.wallet.addresses[0].address, // for testing purpose, send back coin to user wallet to save the fee
        receiver: this.swapTx.target.depositAddress,
        amount: this.swapTx.signature.amount,
        fee: this.swapTx.signature.fee,
        utxos: this.swapTx.signature.utxo,
        change: this.swapTx.signature.change,
        gasLimit: this.swapTx.signature.gasLimit,
        gasPrice: this.swapTx.signature.gasPrice,
        balance: this.swapTx.source.wallet.balance,
        abi: this.io.getAbi(
          this.swapTx.source.wallet.contractaddress,
          this.swapTx.source.wallet.type,
        ),
        contractAddress: this.swapTx.source.wallet.contractaddress,
        lasttx: this.swapTx.source.wallet.lasttx,
        api: this.swapTx.source.wallet.api,
        addressType: this.swapTx.source.wallet.addressType
      });

      console.log('Swap txid', txid);
      const registeredSwapTx = cloneDeep(this.swapTx);
      registeredSwapTx.sourceTxId = txid;

      // Registering transaction in exchange
      loading.message = this.ts.instant(this.$.EXCHANGING_ASSETS);

      // Assigning a reference code if has been provided
      if (this.referenceCode && this.referenceCode !== '') {
        registeredSwapTx.referenceCode = this.referenceCode;
      }

      // Registering transaction in exchange until it succeeded
      if (this.swapRetryResponseSubscription) this.swapRetryResponseSubscription.unsubscribe();
      let countError = 0;
      this.swapRetryResponseSubscription = of(registeredSwapTx)
        .pipe(
          switchMap(swap => from(this._registerInExchange(swap))),
          catchError(err => {
            countError++;
            if (countError < 10) {
              return err.pipe(delay(3000), shareReplay());
            } else {
              return of(err);
            }
          }),
          retryWhen(err => {
            return err.pipe(delay(3000), shareReplay());
          }),
        )
        .subscribe(swapTx => {
          /* tslint:disable:no-string-literal */
          if (swapTx['ok'] === false) {
            if (swapTx['error'] && swapTx['error']['errors']) {
              const err = swapTx['error']['errors'];
              this.utils.showToast(JSON.stringify(err), 3000, 'warning');
            } else {
              this.utils.showToast(swapTx['message'], 3000, 'warning');
            }
          } else {
            this.check(this.swapTx.source.wallet);
            this.dataService.setSwapTransaction(swapTx);
            this.router.navigate(['home', 'swap', 'confirm']);
          }
          /* tslint:enable:no-string-literal */
          loading.dismiss();
        });
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes('transaction simulation failed')) {
        await this.utils.showToast(this.$.TRANSACTION_SIMULATION_FAILED, 3000, 'warning');
      } else if (err.message.toLowerCase().includes('transaction underpriced')) {
        await this.increaseFee();
      } else {
        await this.utils.showToast(err.message, 3000, 'warning');
      }
      await loading.dismiss();
    }
  }

  back() {
    this.router.navigate(['..'], {
      relativeTo: this.route.parent,
    });
  }

  async increaseFee() {
    const alert = await this.alertController.create({
      message: this.$.instant(this.$.MSG_INCREASE_FEE),
      buttons: [
        {
          text: this.$.instant(this.$.CANCEL),
        },
        {
          text: this.$.instant(this.$.OK),
          handler: () => {
            this.swapTx.signature.fee = Math.trunc((this.swapTx.signature.fee * 110) / 100);
            this.swapTx.signature.gasLimit = Math.trunc(
              (this.swapTx.signature.gasLimit * 110) / 100,
            );
            this.swapTx.signature.gasPrice = Math.trunc(
              (this.swapTx.signature.gasPrice * 110) / 100,
            );
          },
        },
      ],
    });
    await alert.present();
  }

  private getPrice(ticker: string, currency: string): number {
    return getPrice(this.rate, ticker, currency);
  }
}
