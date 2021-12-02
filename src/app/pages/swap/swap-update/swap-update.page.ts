import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { SignedTransaction } from 'src/app/interface/data';
import { UtilsService } from 'src/app/services/utils.service';
import { Subscription, interval, Subject, NEVER, BehaviorSubject } from 'rxjs';
import { switchMap, startWith, scan, tap, takeWhile, map, filter } from 'rxjs/operators';
import { Translate } from 'src/app/providers/translate';
import {
  SwapTransaction,
  SwapConvertResponse,
  SwapConvertRequestParams,
  SwapReportItem,
  SwapPair,
} from 'src/app/interface/swap';
import { SingleSwapService } from 'src/app/services/swap/single-swap.service';
import { FinalPageOptions } from 'src/app/components/layout/sio-final-page/sio-final-page.component';

type RouteData = {
  pairs: SwapPair[];
};
type TX = Pick<
  SwapConvertResponse,
  'TargetGuaranteedPrice' | 'TargetGuaranteedWithdrawalAmount' | 'SourceCurrentAmount'
> &
  Pick<SwapReportItem, 'TargetCurrency' | 'SourceCurrency'>;

@Component({
  selector: 'swap-update-page',
  templateUrl: './swap-update.page.html',
  styleUrls: ['./swap-update.page.scss'],
})
export class SwapUpdatePage implements OnInit, OnDestroy {
  swapRetryResponseSubscription: Subscription;

  private _successOpts: FinalPageOptions = {
    title: this.$.instant(this.$.UPDATE_SUCCESS_TITLE),
    subtitle: this.$.instant(this.$.UPDATE_SUCCESS_DESC),
    actionText: this.$.instant(this.$.DONE),
    icon: 'checkmark-outline',
    color: 'primary',
    action: () => this.back(),
  };

  private _failureOpts: FinalPageOptions = {
    title: this.$.instant(this.$.UPDATE_FAILURE_TITLE),
    subtitle: this.$.instant(this.$.UPDATE_FAILURE_DESC),
    actionText: this.$.instant(this.$.DONE),
    icon: 'close-outline',
    color: 'danger',
    action: () => this.back(),
  };

  result: FinalPageOptions = null;

  private _currentSwapTx = this.router.getCurrentNavigation().extras?.state as SwapReportItem;
  private _swapTx = new BehaviorSubject<TX>({
    TargetGuaranteedWithdrawalAmount: this._currentSwapTx.SourceRefundAmount,
    TargetGuaranteedPrice: this._currentSwapTx.TargetPurchasedAmount,
    SourceCurrency: this._currentSwapTx.SourceCurrency,
    TargetCurrency: this._currentSwapTx.TargetCurrency,
    SourceCurrentAmount: this._currentSwapTx.SourceInitialAmount,
  });
  swapTx$ = this._swapTx.asObservable();

  private _pair: SwapPair = null;
  pair$ = this.route.data
    .pipe(
      filter(s => !!s),
      map((s: RouteData) => s.pairs),
      map(pairs =>
        pairs.find(
          p =>
            p.SourceCurrency === this._currentSwapTx.SourceCurrency &&
            p.TargetCurrency === this._currentSwapTx.TargetCurrency,
        ),
      ),
      tap(p => {
        this._pair = p;
      }),
    )
    .subscribe();

  readonly refreshTime = 10;
  private readonly refreshCounter = new Subject<{ pause?: boolean; counter?: number }>();

  swapTx: SwapTransaction<SignedTransaction> = null;
  loading: HTMLIonLoadingElement;
  referenceCode = '';
  canProceed = false;

  get hasResult(): boolean {
    return !!this.result;
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private utilsService: UtilsService,
    private singleSwap: SingleSwapService,
    private utils: UtilsService,
    private loadingCtrl: LoadingController,
    public $: Translate,
  ) {}

  ngOnInit() {
    this._updateSwapAmount();
    this._initCounter();
  }

  ngOnDestroy() {
    this.refreshCounter.unsubscribe();
    this.pair$.unsubscribe();
    if (this.swapRetryResponseSubscription) this.swapRetryResponseSubscription.unsubscribe();
  }

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

  private _resetCounter() {
    this.refreshCounter.next({ pause: false, counter: 0 });
  }

  async presentUpdateAlert() {
    const alert = await this.utils.createAlert({
      header: this.$.UPDATE_PRICE,
      message: [
        this.$.CRYPTO_PRICES_CHANGE_FAST,
        this._currentSwapTx.SourceCurrency,
        'to',
        this._currentSwapTx.TargetCurrency,
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
    const tx = this._swapTx.value;
    const pair = this._pair;
    const convertData: SwapConvertRequestParams = {
      SourceCurrency: tx.SourceCurrency.toUpperCase(),
      SourceAmount: tx.SourceCurrentAmount,
      SourceCurrencyNetwork: pair.SourceCurrencyNetwork,
      TargetCurrency: tx.TargetCurrency.toUpperCase(),
      TargetCurrencyNetwork: pair.TargetCurrencyNetwork,
      TargetExchangeEndpoint: pair.ExchangeEndpoint,
    };

    return this.singleSwap.convert(convertData).then(res => {
      this._swapTx.next({
        SourceCurrentAmount: tx.SourceCurrentAmount,
        SourceCurrency: tx.SourceCurrency,
        TargetCurrency: tx.TargetCurrency,
        TargetGuaranteedPrice: res.TargetGuaranteedPrice,
        TargetGuaranteedWithdrawalAmount: res.TargetGuaranteedWithdrawalAmount,
      });
      return res;
    });
  }

  async onSubmit() {
    if (!this.canProceed) return this.presentUpdateAlert();

    try {
      const tx = this._swapTx.value;
      await this.singleSwap.update({
        price: tx.TargetGuaranteedPrice,
        sagaId: this._currentSwapTx.SagaId,
      });
      this.result = this._successOpts;
    } catch (err) {
      this.result = this._failureOpts;
    }
  }

  back() {
    this.router.navigate(['/home', 'swap']);
  }
}
