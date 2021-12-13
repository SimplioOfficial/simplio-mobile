import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { combineLatest, Subscription, timer } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import {
  IonRouterOutlet,
  LoadingController,
  MenuController,
  ModalController,
} from '@ionic/angular';
import { FirebaseAnalytics } from '@ionic-native/firebase-analytics/ngx';
import { UtilsService } from 'src/app/services/utils.service';
import { Transaction } from 'src/app/interface/data';
import { ThemeService } from 'src/app/services/settings/theme.service';
import {
  distinctUntilChanged,
  filter,
  map,
  pluck,
  share,
  skipWhile,
  switchMap,
  takeWhile,
  tap,
} from 'rxjs/operators';
import { WalletsProvider } from 'src/app/providers/data/wallets.provider';
import { SettingsProvider } from 'src/app/providers/data/settings.provider';
import { TransactionsProvider } from 'src/app/providers/data/transactions.provider';
import { Translate } from 'src/app/providers/translate/';
import { CreateWalletService } from 'src/app/services/wallets/create-wallets.service';
import { CheckWalletsService } from 'src/app/services/wallets/check-wallets.service';
import { PlatformProvider } from 'src/app/providers/platform/platform';
import { ActionsModal, ActionsModalProps } from 'src/app/pages/modals/actions-modal/actions.modal';
import { AuthenticationProvider } from 'src/app/providers/data/authentication.provider';
import { AccountService } from 'src/app/services/authentication/account.service';
import { SwapConnectionService } from 'src/app/services/swap/swap-connection.service';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { SwapProvider } from '../providers/data/swap.provider';
import { NetworkService } from '../services/apiv2/connection/network.service';
import { RateService } from '../services/apiv2/connection/rate.service';
import { WalletService } from '../services/wallet.service';
import { CoinsService } from '../services/apiv2/connection/coins.service';
import { MultiFactorAuthenticationService } from '../services/authentication/mfa.service';
import { TrackedPage } from '../classes/trackedPage';
import { sortBy } from 'lodash';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage extends TrackedPage implements OnInit {
  private readonly REQUEST_PIN_TIMEOUT = 15000;
  private _subscription = new Subscription();
  isConnected$ = this.plt.isConnected$;
  private _loading: any;
  private _pauseTimeout;
  private _timeoutOccurs: boolean | null = null;
  readonly actions: ActionsModalProps = [
    {
      title: this.$.instant(this.$.SEND),
      icon: 'arrow-up',
      cssClass: ['transaction-action-sheet', 'sio-t-btn--action-send'],
      handler: () => this.router.navigate(['home', 'wallets', 'send'], {
        queryParamsHandling: 'merge',
      }),
    },
    {
      title: this.$.instant(this.$.RECEIVE),
      icon: 'arrow-down',
      cssClass: ['transaction-action-sheet'],
      handler: () => this.router.navigate(['home', 'wallets', 'receive'], {
        queryParamsHandling: 'merge',
      }),
    },
    {
      title: this.$.instant(this.$.SWAP),
      icon: 'repeat',
      cssClass: ['transaction-action-sheet'],
      handler: () => this.router.navigate(['home', 'swap', 'exchange'], {
        queryParamsHandling: 'merge',
      }),
    },
    {
      title: this.$.instant(this.$.STAKING),
      icon: 'flash-outline',
      cssClass: ['transaction-action-sheet'],
      handler: () => this.router.navigate(['home', 'swap', 'stake'], {
        queryParamsHandling: 'merge',
      }),
    },
  ];

  tapbarVisibility$ = this.settingsProvider.tapbarVisibility$;

  transactionCheck$ = combineLatest([
    this.settingsProvider.settings$,
    this.networkService.networksData.pipe(filter(e => !!e)),
  ]).pipe(
    map(([s, _]) => s),
    filter(s => !!s),
    share(),
    pluck('refresh'),
    distinctUntilChanged(),
    switchMap(int => timer(0, int * 1000)),
    tap(() => {
      if (!this.checker.checkingList.length) {
        console.log('Check transactions', this.walletsProvider.walletsValue);
        this.checker.checkTransactionsAll(
          {
            wallets: this.walletsProvider.walletsValue,
          },
          () => {
            console.log('Check transactions is finished');
            this.rateService.refresh(false);
          },
        );
      }
    }),
  );

  missingWallets$ = this.walletsProvider.missingWallet$.pipe(
    takeWhile(wd => !!wd.length && !this.walletCreator.pushingWalletStatus),
    map(walletData =>
      walletData.map(wd => {
        return wd.setMnemo(this.walletsProvider.masterSeedValue.sed);
      }),
    ),
    tap(walletData => {
      this.walletCreator.setPushingMissingWallet(true);
      Promise.all(
        walletData.map(
          w =>
            !this.walletService.getWalletByCoin(w.value().ticker, w.value().uid) &&
            this.walletCreator.createWallet(w),
        ),
      ).then(() => {
        this.walletCreator.setPushingMissingWallet(false);
        this.walletService.getWalletsOf();
      });
    }),
  );

  storeAccount$ = this.authProvider.storeAccount$.pipe(
    skipWhile(v => !v),
    switchMap(() => this.authProvider.account$),
    filter(acc => !!acc),
    tap(acc => this.acc.addAccount(acc)),
  );

  coinsData$ = this.coinsService.coinsData$.pipe(
    filter(res => !!res && res.length > 0),
    map(_ => {
      this._subscription.add(this.missingWallets$.subscribe());
    }),
  );

  appResume$ = this.plt.appResume$.pipe(
    map(async isResume => {
      if (isResume) {
        console.log('App resume');
        if (this._timeoutOccurs) {
          await this._showPin();
        }
        clearTimeout(this._pauseTimeout);
        this._timeoutOccurs = false;
        const acc = this.authProvider.accountValue;

        // check if ws is connected or not
        if (!this.swapConn.isConnected || !this.auth.isValid(acc.atk)) {
          // if it's not connected, check token validation and start connection again
          if (this.auth.isValid(acc.atk)) this.swapConn.start({ token: acc.atk });
          else this.auth.refresh(acc).then(a => this.swapConn.start({ token: a.atk }));
        }
      } else if (this._timeoutOccurs === false) {
        console.log('App pause');
        this._pauseTimeout = setTimeout(() => {
          console.log('Locking up the application...');
          this._timeoutOccurs = true;
        }, this.REQUEST_PIN_TIMEOUT);
      } else {
        console.log('App start');
        this._timeoutOccurs = false;
      }
    }),
  );

  gettingSwapData$ = this.swapProvider.gettingsSwapData$.pipe(
    map(async isSwaping => {
      if (isSwaping === true) {
        this.swapProvider.updateSwapStatus(null);
        await this._presentPreparingSwap();
      } else if (isSwaping === false) {
        this.swapProvider.updateSwapStatus(null);
        await this._closePreparingSwap();
      }
    }),
  );

  instant = s => this.translateService.instant(s);

  constructor(
    private router: Router,
    private acc: AccountService,
    private plt: PlatformProvider,
    private rateService: RateService,
    private modalCtrl: ModalController,
    private swapProvider: SwapProvider,
    private coinsService: CoinsService,
    private themeService: ThemeService,
    private auth: AuthenticationService,
    private checker: CheckWalletsService,
    private walletService: WalletService,
    private routerOutlet: IonRouterOutlet,
    private networkService: NetworkService,
    private swapConn: SwapConnectionService,
    private walletsProvider: WalletsProvider,
    private translateService: TranslateService,
    private walletCreator: CreateWalletService,
    private settingsProvider: SettingsProvider,
    private authProvider: AuthenticationProvider,
    private firebaseAnalytics: FirebaseAnalytics,
    private loadingController: LoadingController,
    private mfa: MultiFactorAuthenticationService,
    private transactionProvider: TransactionsProvider,
    public $: Translate,
    public menuCtrl: MenuController,
  ) {
    super(true);
  }

  ngOnInit() {
    // disable swiping back
    this.coinsService.init();
    this.routerOutlet.swipeGesture = false;
  }

  private async _presentPreparingSwap() {
    this._loading = await this.loadingController.create({
      message: this.instant(this.$.PREPARING_SWAP),
      duration: 25000,
    });
    await this._loading.present();
  }

  private async _closePreparingSwap() {
    if (this._loading) {
      await this._loading.dismiss();
    }
  }

  private async _showPin() {
    const modal = await this.mfa.showIdentityVerificationModal({
      fullScreen: true,
      attempts: 3,
      warnAt: 2,
    });

    const {
      data: {
        result: [isVerified],
      },
    } = await modal.onDidDismiss();

    if (!isVerified) await this.auth.logout();
  }

  filterTxs = tx => {
    let valid = false;
    UtilsService.txsProperties.some(element => {
      if (element in tx.data) {
        valid = true;
        return;
      }
    });
    return valid;
  };

  ionViewWillEnter() {
    const acc = this.authProvider.accountValue;
    if (this.auth.isValid(acc.atk)) this.swapConn.start({ token: acc.atk });
    else this.auth.refresh(acc).then(a => this.swapConn.start({ token: a.atk }));

    const transactionsAPISubscription = this.transactionProvider.transactions$
      .pipe(filter(tx => !!tx))
      .subscribe(tx => {
        try {
          const wallet = this.walletService.getWallet(tx._uuid);
          if (!!wallet) {
            if (!tx.data.length) {
              if (tx.endBlock) {
                wallet.lastblock = tx.endBlock;
                this.walletService.updateWallet(wallet._uuid, wallet, false);
              }
              this.walletsProvider.pushRescanning(wallet._uuid, false);
              this.checker.checkingDone(tx._uuid, tx.data);
              return tx.data;
            }

            const sortedTxs: Transaction[] = sortBy(tx.data, 'unix').reverse();
            let wTxs = wallet.transactions
              ? wallet.transactions.filter(
                e => sortedTxs.findIndex(ee => ee.hash === e.hash) === -1,
              )
              : [];
            const unconfirmed = sortedTxs.filter(e => e.confirmed === false).length;
            const pending = wTxs.filter(e => e.confirmed === false).length;
            const combinedTxs = sortBy([...wTxs, ...sortedTxs], 'unix')
              .reverse()
              .slice(0, 20);

            if (wallet.lasttx !== sortedTxs[0].hash || wallet.unconfirmed !== unconfirmed || pending != unconfirmed) {
              if (pending != unconfirmed && wTxs.length > 0 && wTxs[0].block > sortedTxs[0].block) {
                // do not update data if there's still pending transaction and no new transaction after last transaction time
              }
              else {
                wallet.transactions = combinedTxs;
                if (tx.endBlock) {
                  wallet.lastblock = tx.endBlock;
                } else {
                  wallet.lastblock = sortedTxs[0].block;
                }
                wallet.lasttx = sortedTxs[0].hash;
                wallet.unconfirmed = unconfirmed;
              }
              let explorers = this.networkService.getCoinExplorers(wallet.ticker, wallet.type);
              if (!!explorers?.length) {
                explorers = explorers.filter(e => e.type === explorers[0].type);
              }
              this.walletService
                .getWalletBalance(wallet, explorers)
                .then(_ => {
                  this.walletsProvider.pushRescanning(wallet._uuid, false);
                  this.checker.checkingDone(tx._uuid, tx.data);
                })
                .catch(_ => {
                  this.walletsProvider.pushRescanning(wallet._uuid, false);
                  this.checker.checkingDone(tx._uuid, tx.data);
                });
            } else {
              if (tx.endBlock) {
                wallet.lastblock = tx.endBlock;
                this.walletService.updateWallet(wallet._uuid, wallet, false);
              }
              if (wallet.transactions.length < combinedTxs.length) {
                wallet.transactions = combinedTxs;
                this.walletService.updateWallet(wallet._uuid, wallet, true);
              }
              this.walletsProvider.pushRescanning(wallet._uuid, false);
              this.checker.checkingDone(tx._uuid, tx.data);
            }
          }
        } catch (err) {
          this.checker.checkingDone(tx._uuid, tx.data);
          console.error('Parsing transaction exception', err);
        }
      });

    // Theme subscription
    const themeSubscription = this.settingsProvider.theme$.subscribe(theme => {
      if (!theme) return;
      this.themeService.applyTheme(theme);
    });

    this._subscription.add(transactionsAPISubscription);
    this._subscription.add(this.transactionCheck$.subscribe());
    this._subscription.add(this.coinsData$.subscribe());
    this._subscription.add(themeSubscription);
    this._subscription.add(this.storeAccount$.subscribe());
    this._subscription.add(this.appResume$.subscribe());
    this._subscription.add(this.gettingSwapData$.subscribe());
  }

  ionViewDidLeave() {
    this._timeoutOccurs = null;
    this.swapConn.stop();
    this._subscription.unsubscribe();
  }

  // _navigateWithWallet(...route) {
  //   const wallets = this.walletsProvider.walletsValue;
  //   const primaryWallet = this.settingsProvider.settingsValue?.primaryWallet;
  //   const overviewWallet = this.walletsProvider.walletValue;
  //   const wallet = overviewWallet || findPrimaryWallet(wallets, primaryWallet) || wallets[0];

  //   this.router.navigate(route, {
  //     state: {
  //       wallet,
  //       origin: this.location.path(),
  //     },
  //   });
  // }

  // _navigateSwap(...route) {
  //   const wallets = this.walletsProvider.walletsValue;
  //   const primaryWallet = this.settingsProvider.settingsValue?.primaryWallet;
  //   const overviewWallet = this.walletsProvider.walletValue;
  //   const w = overviewWallet || findPrimaryWallet(wallets, primaryWallet);
  //   // this.swapProvider.pushSwapData({
  //   //   wallet: w,
  //   //   pair: !!w ? [w, null] : [],
  //   //   amount: 0,
  //   // });

  //   this.router.navigate(route, {
  //     state: {
  //       origin: this.location.path(),
  //       wallet: w
  //     },
  //   });
  // }

  async showActions() {
    const modal = await this.modalCtrl.create({
      component: ActionsModal,
      componentProps: { actions: this.actions },
      mode: 'ios',
      cssClass: 'bottom-modal',
      swipeToClose: true,
    });
    await modal.present();
  }
}
