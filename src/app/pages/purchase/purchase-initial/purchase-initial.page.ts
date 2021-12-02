import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { BehaviorSubject } from '@polkadot/x-rxjs';
import { of } from 'rxjs';

import { debounceTime, distinctUntilChanged, filter, map, switchMap, tap } from 'rxjs/operators';

import {
  isGreaterOrEqualThan,
  isGreaterThan,
  isLessOrEqualThan,
} from '../../../../shared/validators';
import { SioBuyValueComponent } from '../../../components/form/sio-buy-value/sio-buy-value.component';
import { Rate, Wallet, WalletsData } from '../../../interface/data';
import { TrackedPage } from '../../../classes/trackedPage';
import { SettingsProvider } from '../../../providers/data/settings.provider';
import { SwipeluxProvider } from '../../../providers/swipelux/swipelux-provider.service';
import { RateService } from '../../../services/apiv2/connection/rate.service';
import {
  CurrencyPair,
  OrderData,
  SwipeluxService,
} from '../../../services/swipelux/swipelux.service';
import { pipeAmount, UtilsService } from '../../../services/utils.service';
import { getPrice } from 'src/app/services/wallets/utils';
import { Translate } from '../../../providers/translate';
import { WalletsProvider } from '../../../providers/data/wallets.provider';
import { TransactionPairsModal } from '../../modals/transaction-pairs-modal/transaction-pairs.modal';

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

  private routeData: OrderData;

  private _wallet = new BehaviorSubject<Wallet>(null);
  private _wallets: Wallet[] = [];
  routeDataSubscription$ = this.route.data
    .pipe(
      filter(d => !!d),
      tap(({ wallets: w }: RouteData) => {
        console.log(55, w);

        this._wallets = w.wallets;
        this._wallet.next(w.primaryWallet);
      }),
    )
    .subscribe();
  private _swapList: CurrencyPair[] = [];
  wallet$ = this._wallet.pipe(
    filter(w => !!w),
    tap(w => {
      console.log(64, this._swapList);
      const swapPair = this._swapList.find(p => p.toCurrency.a3 === w.ticker);
      this.formField.patchValue({
        swapPair,
        wallet: w,
      });
    }),
  );
  private _rates = this.rateService.rateValue;
  private _originUrl = this.router.getCurrentNavigation().extras.state?.origin || '/home/wallets';
  readonly MAX_DECIMAL_PLACES = 2;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private rateService: RateService,
    private utilsService: UtilsService,
    private modalCtrl: ModalController,
    private walletsProvider: WalletsProvider,
    private swipeluxService: SwipeluxService,
    private swipeluxProvider: SwipeluxProvider,
    private settingsProvider: SettingsProvider,
    public $: Translate,
  ) {
    super();
    this.swipeluxService.getPairs().then(res => {
      // this._swapList = res.items;
      console.log(
        89,
        res.items.filter(a => a.fromCurrency.isEnabled && a.toCurrency.isEnabled),
      );
      this._swapList = res.items.filter(a => a.fromCurrency.isEnabled && a.toCurrency.isEnabled);
    });

    //  .then(() => this.swipeluxService.getCurrencies())

    // .then(res => console.log(73, res))
    // .then(() => this.swipeluxService.getPairs())
    // .then(res => console.log(75, res))
    // .then(() =>
    // this.swipeluxService
    //   .getRateFromTo('EUR', 'BTC')
    //   .then(res =>
    //     this.swipeluxService.createOrderAndAuthenticateUser(
    //       '+420608978956',
    //       {
    //         currency: res.pair.fromCurrency.a3,
    //         amount: res.pair.fromCurrency.minimum
    //       },
    //       {
    //         currency: res.pair.toCurrency.a3,
    //         amount: res.pair.fromCurrency.minimum / res.rate.amount
    //       }
    //     )
    //   )
    //   .then(res => {
    //     this.swipeluxProvider.setAuthToken(res.token);
    //     return res.code;
    //   })
    //   .then(code => this.swipeluxService.verifyPhone(code))
    //   .then(() => this.swipeluxService.setEmail('jan.vrastil2@simplio.io'))
    //   .then(res => this.swipeluxService.verifyEmail(res.code))
    //   .then(() => this.swipeluxService.setAddress('19HqQzgFBw6sdarpY1eSLLsHfCfnz9Mtjq'))
    //   .then(() => this.swipeluxService.getKycToken())
    //   .then(async res => {
    //     if (res.passed) {
    //       const orders = await this.swipeluxService.getOrders();
    //       if (!!orders.uid) {
    //         const paymentData = await this.swipeluxService.initializePayment();
    //
    //         // const modal = await this.modalCtrl.create({
    //         //   component: PaymentGatewayModal,
    //         //   componentProps: { paymentUrl: paymentData.paymentUrl },
    //         //   cssClass: ['full-screen']
    //         // });
    //         //
    //         // await modal.present();
    //         // await modal.onWillDismiss();
    //       }
    //     } else {
    //       this.swipeluxProvider.setSumsubToken(res.token);
    //       await this.router.navigate(['/home', 'user', 'account', 'lock']);
    //     }
    //   })
    //   .then(() => this.swipeluxService.getMerchantOrders());
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

  onSubmit() {
    try {
      this.routeData = {
        user: {
          phone: '',
        },
        order: {
          from: {
            currency: this.currency,
            amount: this.formField.value.amount,
          },
          to: {
            currency: this.formField.value.wallet.ticker,
            amount: this.targetAmount,
          },
        },
      };

      this.router.navigate(['phone-number'], {
        relativeTo: this.route.parent.parent,
        state: {
          orderData: this.routeData,
        },
      });
    } catch (e) {
      this.utilsService.showToast(e.message, 3000, 'warning');
    }
  }

  async openTargetWalletModal() {
    console.log(
      204,
      this._swapList
        .filter(a => a.fromCurrency.a3 === 'USD')
        .filter(a => this._wallets.find(b => b.ticker === a.toCurrency.a3))
        .map(a => a.toCurrency.a3),
    );
    const modal = await this._presentModal(TransactionPairsModal, {
      title: this.$.instant(this.$.SELECT_CRYPTO),
      usdPairs: this._swapList
        .filter(a => a.fromCurrency.a3 === 'USD')
        .filter(a => this._wallets.find(b => b.ticker === a.toCurrency.a3)),
      eurPairs: this._swapList
        .filter(a => a.fromCurrency.a3 === 'EUR')
        .filter(a => this._wallets.find(b => b.ticker === a.toCurrency.a3)),
    });
    const selectedPair: CurrencyPair = await modal.onWillDismiss().then(({ data }) => data);
    console.log(215, selectedPair);
    if (!!selectedPair) {
      const wallet = this._wallets.find(w => w.ticker === selectedPair.toCurrency.a3);
      if (!!wallet) {
        this._wallet.next(wallet);
        this.currency = selectedPair.fromCurrency.a3;

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
      .getRateFromTo(this.currency, this._wallet.value.ticker)
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

  onAmountChange(amount: number) {
    this.valueComponent.updateInputValue(amount);
  }

  get currentErrorMsg(): string {
    return this.formField.errors?.msg || '';
  }
}
