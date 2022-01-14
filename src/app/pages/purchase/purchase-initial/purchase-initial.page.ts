import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, switchMap, tap } from 'rxjs/operators';
import { LoadingController, ModalController } from '@ionic/angular';
import { BehaviorSubject } from '@polkadot/x-rxjs';
import { testCoins } from '../../../../assets/json/coinlist';
import { environment } from '../../../../environments/environment';

import {
  isGreaterOrEqualThan,
  isGreaterThan,
  isLessOrEqualThan,
} from '../../../../shared/validators';
import { SioBuyValueComponent } from '../../../components/form/sio-buy-value/sio-buy-value.component';
import { Rate, Wallet, WalletsData } from '../../../interface/data';
import { TrackedPage } from '../../../classes/trackedPage';
import { CurrencyPair, OrderDataWithToken } from '../../../interface/swipelux';
import { SettingsProvider } from '../../../providers/data/settings.provider';
import { SwipeluxProvider } from '../../../providers/swipelux/swipelux-provider.service';
import { RateService } from '../../../services/apiv2/connection/rate.service';
import { SwipeluxService } from '../../../services/swipelux/swipelux.service';
import { pipeAmount, UtilsService } from '../../../services/utils.service';
import { getPrice } from 'src/app/services/wallets/utils';
import { Translate } from '../../../providers/translate';
import { WalletsProvider } from '../../../providers/data/wallets.provider';
import { TransactionPairsModal } from '../../modals/transaction-pairs-modal/transaction-pairs.modal';

declare const SNSMobileSDK: import('@sumsub/cordova-idensic-mobile-sdk-plugin/dist/SNSMobileSDK');

type RouteData = {
  wallets: WalletsData;
};

@Component({
  selector: 'purchase-initial-page',
  templateUrl: './purchase-initial.page.html',
  styleUrls: ['./purchase-initial.page.scss'],
})
export class PurchaseInitialPage extends TrackedPage implements OnInit {
  @ViewChild(SioBuyValueComponent) valueComponent: SioBuyValueComponent;

  currency = this.settingsProvider.currency;
  isPending = false;
  loading = true;
  formField: FormGroup = this.fb.group({
    wallet: [null, [Validators.required]],
    amount: [0, [Validators.required, isGreaterThan(0)]],
    resultRate: [null, [Validators.required]],
  });
  walletSelectingDisabled = false;

  private _wallet = new BehaviorSubject<Wallet>(null);
  wallet$ = this._wallet.pipe(filter(w => !!w));
  private _wallets: Wallet[] = [];
  routeDataSubscription$ = this.route.data
    .pipe(
      filter(d => !!d),
      tap(({ wallets: w }: RouteData) => {
        this._wallets = w.wallets;
        this._wallet.next(w.primaryWallet);
      }),
    )
    .subscribe();
  private _swapList: CurrencyPair[] = [];
  private _rates = this.rateService.rateValue;
  private _originUrl = this.router.getCurrentNavigation().extras.state?.origin || '/home/wallets';
  readonly MAX_DECIMAL_PLACES = 2;
  private readonly sumSubApiUrl = environment.SUM_SUB_API_URL;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private rateService: RateService,
    private utilsService: UtilsService,
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController,
    private walletsProvider: WalletsProvider,
    private swipeluxService: SwipeluxService,
    private swipeluxProvider: SwipeluxProvider,
    private settingsProvider: SettingsProvider,
    public $: Translate,
  ) {
    super();
    this.swipeluxService.getPairs().then(res => {
      this._swapList = res.items
        .filter(a => a.fromCcy.isEnabled && a.toCcy.isEnabled)
        .map(a =>
          environment.production
            ? a
            : {
                ...a,
                toCcy: {
                  ...a.toCcy,
                  a3: testCoins.find(b => b.isTestCoinFor === a.toCcy.a3)?.ticker,
                },
              },
        );

      const walletTickers = this._wallets.map(a => a.ticker);
      let swapPair = this._swapList.find(
        p => walletTickers.includes(p.toCcy.a3) && p.fromCcy.a3 === this.currency,
      );

      // in case default currency is not available select the first pair
      if (!swapPair) {
        swapPair = this._swapList.find(p => walletTickers.includes(p.toCcy.a3));

        if (!!swapPair) {
          this.currency = swapPair.fromCcy.a3;
        } else {
          this.walletSelectingDisabled = true;
          this.utilsService.showToast(
            'Purchasing for your active wallets is not possible in the moment',
            3000,
            'warning',
          );
        }
      }

      // select first available wallet for purchase
      if (!!swapPair) {
        const wallet = this._wallets.find(a => a.ticker === swapPair.toCcy.a3);
        this._wallet.next(wallet);
        this.formField.patchValue({
          swapPair,
          wallet,
        });
      }
    });
  }

  ngOnInit() {
    this.formField.valueChanges
      .pipe(
        tap(() => {
          this.isPending = true;
        }),
        debounceTime(1000),
        map(v => v.amount),
        distinctUntilChanged<number>((a, b) => {
          if (a === b && this.isPending) {
            this.isPending = false;
          }
          return a === b;
        }),
        switchMap(_ => of(this._convert(parseFloat(this.valueComponent.inputValue)))),
      )
      .subscribe();
  }

  back() {
    this.router.navigateByUrl(this._originUrl);
  }

  getFiatValue(wallet: Wallet): number {
    if (!wallet) {
      return 0;
    }
    const { balance, ticker, type } = wallet;
    return pipeAmount(balance, ticker, type, this.getDecimals(), true) * this.getRate(wallet);
  }

  getPrice(rates: Rate[], coin: string, currency: string): number {
    return getPrice(rates, coin, currency);
  }

  getRate(wallet: Wallet): number {
    return this.getPrice(this._rates, wallet.ticker, this.currency);
  }

  onAmountChange(amount: number) {
    this.valueComponent.updateInputValue(amount);
  }

  async onSubmit() {
    try {
      const shareToken = this.swipeluxProvider.shareToken;
      const targetAddress = this.walletsProvider.walletsValue.find(
        a => a.ticker === this.formField.value.wallet.ticker,
      ).mainAddress;

      console.log(172, this.walletsProvider.walletsValue);

      const order: OrderDataWithToken = {
        currencyPair: {
          from: this.currency,
          to: this.getWalletTicker(),
        },
        shareToken,
        targetAddress,
        targetAmount: Math.round(this.targetAmount * 1e8), // integer amount in satoshi
      };

      const status = await this.swipeluxService
        .createOrderByShareToken(order)
        .then(res => {
          console.log(163, res);
          this.swipeluxProvider.setAuthToken(res.accessToken);
        })
        .then(() => this.swipeluxService.getKycStatus());

      if (status.passed) {
        await this.initializePayment();
      } else {
        this.initializeSumSub(status.token);
      }
    } catch (e) {
      this.utilsService.showToast(e.message, 3000, 'warning');
    }
  }

  async openTargetWalletModal() {
    console.log(
      204,
      this._swapList
        .filter(a => a.fromCcy.a3 === 'USD')
        .filter(a => this._wallets.find(b => b.ticker === a.toCcy.a3))
        .map(a => a.toCcy.a3),
    );
    const modal = await this._presentModal(TransactionPairsModal, {
      title: this.$.instant(this.$.SELECT_CRYPTO),
      usdPairs: this._swapList
        .filter(a => a.fromCcy.a3 === 'USD')
        .filter(a => this._wallets.find(b => b.ticker === a.toCcy.a3)),
      eurPairs: this._swapList
        .filter(a => a.fromCcy.a3 === 'EUR')
        .filter(a => this._wallets.find(b => b.ticker === a.toCcy.a3)),
    });
    const selectedPair: CurrencyPair = await modal.onWillDismiss().then(({ data }) => data);
    console.log(215, selectedPair);
    if (!!selectedPair) {
      const wallet = this._wallets.find(w => w.ticker === selectedPair.toCcy.a3);
      if (!!wallet) {
        this._wallet.next(wallet);
        this.currency = selectedPair.fromCcy.a3;

        this.formField.patchValue({
          amount: 0,
          wallet,
        });
        await this._convert(parseFloat(this.valueComponent.inputValue));
        this.valueComponent.resetInputValue();
      } else {
        this.utilsService.showToast(
          this.$.instant(this.$.CREATE_WALLET_FIRST, { value1: wallet.name }),
          2000,
          'warning',
        );
      }
    }
  }

  get currentErrorMsg(): string {
    return this.formField.errors?.msg || '';
  }

  get targetAmount(): number {
    const rate = this.formField.value?.resultRate;
    return this.formField.value.amount * rate;
  }

  private _convert(value: number): Promise<void> {
    if (value === 0) {
      this.formField.clearValidators();
      this.formField.patchValue({ swapResponse: null });
      this.isPending = false;
      return Promise.resolve();
    }

    this.isPending = true;

    return this.swipeluxService
      .getRateFromTo(this.currency, this.getWalletTicker())
      .then(res => {
        console.log(259, res);
        this.isPending = false;
        if (!!res?.rate?.amount) {
          this.formField.patchValue({ resultRate: res.rate.amount ? 1 / res.rate.amount : 0 });
          this.formField.controls.amount.clearValidators();
          this.formField.controls.amount.addValidators([
            isGreaterOrEqualThan(res.rate.currency.minimum),
            isLessOrEqualThan(res.rate.currency.maximum),
          ]);
          this.formField.patchValue({ amount: this.formField.value.amount });
        }

        console.log(260, this.formField.valid);
      })
      .catch(e => {
        console.error(e);
        this.utilsService.showToast('An error occurred, please try it later', 2000, 'warning');
        this.isPending = false;
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

  private getDecimals(): number {
    return UtilsService.getDecimals(this._wallet.value.type, this._wallet.value.ticker);
  }

  private async initializePayment() {
    const loading = await this.loadingCtrl.create();
    loading.present();

    const order = await this.swipeluxService.getCurrentOrder();

    loading.dismiss();
    console.log(309, order);
    if (!!order) {
      this.router.navigate(['summary'], {
        relativeTo: this.route.parent.parent,
        state: {
          order,
        },
      });
    }
  }

  private getWalletTicker(): string {
    return environment.production
      ? this._wallet.value.ticker
      : testCoins.find(a => a.ticker === this._wallet.value.ticker).isTestCoinFor;
  }

  private initializeSumSub(token: string) {
    const snsMobileSDK = SNSMobileSDK.Builder(this.sumSubApiUrl, 'msdk-basic-kyc')
      .withAccessToken(token, () => {
        // this is a token expiration handler, will be called if the provided token is invalid or got expired
        return new Promise(resolve =>
          resolve(async () => (await this.swipeluxService.getKycStatus()).token),
        ).catch(e => console.error(e));
      })
      .withHandlers({
        // Optional callbacks you can use to get notified of the corresponding events
        onStatusChanged: async event => {
          console.log('onStatusChanged: [' + event.prevStatus + '] => [' + event.newStatus + ']');

          this.initializePayment();
        },
        // Prepared callbacks:
        onStatusDidChange: () => null,
        onDidDismiss: () => null,
      })
      .withDebug(!environment.production)
      .build();

    snsMobileSDK
      .launch()
      .then(async ({ status }) => console.log(198, status))
      .catch(err => console.log('SumSub SDK Error: ' + JSON.stringify(err)));
  }
}
