import { ActivatedRoute, Router } from '@angular/router';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { Browser } from '@capacitor/browser';
import {
  AlertController,
  AnimationController,
  IonInfiniteScroll,
  LoadingController,
  NavController,
} from '@ionic/angular';
import { Animation } from '@ionic/core';
import { orderBy, sortBy, toLower as lc } from 'lodash';
import { Transaction, TransactionAPI, TxType, Wallet, WalletType } from 'src/app/interface/data';
import { copyInputMessage, pipeAmount, UtilsService } from 'src/app/services/utils.service';
import { WalletService } from 'src/app/services/wallet.service';
import { BalancePipe } from 'src/app/pipes/balance.pipe';
import { SettingsProvider } from 'src/app/providers/data/settings.provider';
import { WalletsProvider } from 'src/app/providers/data/wallets.provider';
import { Translate } from 'src/app/providers/translate/';
import { CacheWallet } from 'src/app/interface/cache';
import { getPrice } from 'src/app/services/wallets/utils';
import { CheckWalletsService } from 'src/app/services/wallets/check-wallets.service';
import { SvgIcon } from 'src/assets/icon/icons.js';
import { NetworkService } from 'src/app/services/apiv2/connection/network.service';
import { RateService } from 'src/app/services/apiv2/connection/rate.service';
import { TransactionsProvider } from 'src/app/providers/data/transactions.provider';
import { IoService } from 'src/app/services/io.service';
import { AuthenticationProvider } from 'src/app/providers/data/authentication.provider';
import { coinNames }from "@simplio/backend/api/utils/coins"
import { TrackedPage } from '../../../classes/trackedPage';
import { SioPageComponent } from '../../../components/layout/sio-page/sio-page.component';
import { BackendService } from 'src/app/services/apiv2/blockchain/backend.service';
import { Utils } from '@simplio/backend/utils';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.page.html',
  styleUrls: ['./overview.page.scss'],
})
export class OverviewPage extends TrackedPage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  @ViewChild(SioPageComponent) pageComponent: SioPageComponent;

  @ViewChild('header', { static: false }) header: ElementRef<HTMLElement>;
  @ViewChild('scrollableHeader', { static: false }) scrollableHeader: ElementRef<HTMLElement>;
  @ViewChild('transactionsElem', { static: false }) transactionsElem: ElementRef<HTMLElement>;

  displayTopHeader = true;
  selectedBalance = null;
  txType = TxType;
  transactions: Transaction[] = [];
  transactionsInitial: Transaction[] = [];
  transactionsAPI: TransactionAPI;
  coinPrice: number;
  data: any;
  walletColor: string;
  coinRate: number;
  event: any;
  currency = this.settingsProvider.settingsValue.currency;
  locale = this.settingsProvider.settingsValue.language;
  feePolicy = this.settingsProvider.settingsValue.feePolicy;
  rate$ = this.rateService.rate$.pipe(
    filter(r => !!r),
    map(r => r.find(rate => lc(rate.code) === lc(this.currency))),
    map(r => r?.rate ?? 1),
  );

  private _subscription = new Subscription();
  private loading;
  private newsPage = 1;
  private _wallet: Wallet = null;
  private _wallets: Wallet[] = [];
  wallets$ = this.walletsProvider.wallets$.pipe(
    map(w => sortBy(w, '_p')),
    tap(w => {
      this._wallets = w;
      if (this._wallet) {
        this._wallet = w.find(e => e._uuid === this._wallet._uuid);
      }
    }),
  );
  private w$ = this.walletsProvider.wallet$.pipe(filter(w => !!w));
  wallet$ = this.w$.pipe(
    tap(w => {
      this._wallet = w;
      this.pushTransactions(this._wallet.transactions, true);
      import('src/assets/icon/icons.js').then(mod => {
        this.walletColor = (mod[w.ticker.toUpperCase()] as SvgIcon)
          ? (mod[w.ticker.toUpperCase()] as SvgIcon).graph
          : '';
      });
    }),
  );
  private _transactions = new BehaviorSubject<Transaction[]>([]);
  transactions$ = this._transactions;
  private txs$ = this.transactionProvider.transactions$
    .pipe(filter(tx => !!tx.data && tx._uuid === this._wallet?._uuid))
    .subscribe(txData => {
      const txs = this._transactions.value;
      const wTxs = txs ? txs.filter(e => txData.data.findIndex(ee => ee.hash === e.hash) === -1) : [];
      const combinedTxs = sortBy([...wTxs, ...txData.data], 'unix')
        .reverse()
        .slice(0, 20);

      if (
        txData.data.length > txs.length ||
        txData.data[0]?.hash !== txs[0]?.hash ||
        txData.data[0]?.confirmed !== txs[0]?.confirmed
      ) {
        this.pushTransactions(combinedTxs, true);
      }
    });
  private route$ = this.route.data.pipe(
    map(r => r.transactions),
    tap(r => {
      const txs = this._transactions.value;
      if (!txs.length && r.length > txs.length) {
        this.pushTransactions(r, true);
      }
    }),
  );
  private _canLoadNews = true;

  private hideAnimation: Animation;
  private showAnimation: Animation;

  private hideAnimation2: Animation;
  private showAnimation2: Animation;

  // private _shadowNews: NewsItem[] = [];
  // private _news = new Subject<NewsItem[]>();
  // news$ = this.w$.pipe(
  //   switchMap(w =>
  //     this._news.pipe(
  //       startWith(this.newsProvider.getNewsOf(w.ticker)),
  //       tap(news => (this._shadowNews = news))
  //     )
  //   )
  // );
  private _isLoadingNews = new BehaviorSubject(true);
  isLoadingNews$ = this._isLoadingNews.asObservable();

  private readonly ANIMATION_DURATION = 100; // ms

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private walletService: WalletService,
    private rateService: RateService,
    private alertController: AlertController,
    private utilsService: UtilsService,
    private networkService: NetworkService,
    private settingsProvider: SettingsProvider,
    private walletsProvider: WalletsProvider,
    public $: Translate,
    private checker: CheckWalletsService,
    private transactionProvider: TransactionsProvider,
    private io: IoService,
    private backendService: BackendService,
    private navCtrl: NavController,
    private animCtrl: AnimationController,
    private authProvider: AuthenticationProvider,
    private translateService: TranslateService,
    private loadingController: LoadingController,
  ) {
    super();
  }

  ngOnInit() {
    const isCheckingSubscription$ = this.checker.isChecking$.subscribe(dat => {
      if (!dat && this.event) {
        this.event.target.complete();
      }
    });

    // TODO Enable news
    // this._loadNews();

    this._subscription.add(this.route$.subscribe());
    this._subscription.add(this.rate$.subscribe());
    this._subscription.add(this.txs$);
    this._subscription.add(isCheckingSubscription$);
    this._subscription.add(this.wallets$.subscribe());
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }

  ngAfterViewInit(): void {
    if (this.header && this.scrollableHeader) {
      const headerHeight = this.header.nativeElement.clientHeight;
      const scrollableHeaderHeight = this.scrollableHeader.nativeElement.clientHeight;

      this.hideAnimation = this.animCtrl
        .create('hideAnimation2')
        .addElement(this.header.nativeElement.children[1])
        .duration(this.ANIMATION_DURATION)
        .fromTo('opacity', `0`, `1`);

      this.showAnimation = this.animCtrl
        .create('showAnimation2')
        .addElement(this.header.nativeElement.children[1])
        .duration(this.ANIMATION_DURATION)
        .fromTo('opacity', `1`, `0`);

      this.showAnimation2 = this.animCtrl
        .create('hideAnimation')
        .addElement(this.scrollableHeader.nativeElement)
        .duration(this.ANIMATION_DURATION)
        .keyframes([
          { offset: 0, top: `0px`, height: `${scrollableHeaderHeight}px`, opacity: 1 },
          {
            offset: 1,
            top: `-${scrollableHeaderHeight}px`,
            height: `${headerHeight}px`,
            opacity: 0,
          },
        ])
        .beforeStyles({ position: 'relative' });

      this.hideAnimation2 = this.animCtrl
        .create('showAnimation')
        .addElement(this.scrollableHeader.nativeElement)
        .duration(this.ANIMATION_DURATION)
        .keyframes([
          {
            offset: 0,
            top: `-${scrollableHeaderHeight}px`,
            height: `${headerHeight}px`,
            opacity: 0,
          },
          { offset: 1, top: `0px`, height: `${scrollableHeaderHeight}px`, opacity: 1 },
        ])
        .beforeStyles({ position: 'relative' });

      // this.hideAnimation.play();
    }
  }

  back() {
    this.router.navigate(['/home', 'wallets'], {
      state: {
        walletId: this._wallet.uniqueId,
      },
    });
  }

  instant = s => this.translateService.instant(s);

  copy(value) {
    copyInputMessage(value);
    this.utilsService.showToast(this.$.instant(this.$.COPIED_TO_CLIPBOARD));
  }

  async loadData(e: IonInfiniteScroll) {
    try {
      const transactions = await this.walletService.getTransactionsOf(this._wallet);
      this.pushTransactions(transactions);
      e.complete();
    } catch (err) {
      e.complete();
    }
  }

  doRefresh(event) {
    this.event = event;
    setTimeout(() => {
      event.detail.complete();
    }, 2000);
    this.checker.checkTransactions(
      {
        wallets: [this._wallet],
      },
      () => {
        event.detail.complete();
      },
    );
  }

  getPrice(ticker: string, currency: string): number {
    return getPrice(this.rateService.rateValue, ticker, currency);
  }

  goToTools() {
    this.router.navigate(['./', 'tools'], {
      relativeTo: this.route,
      state: {
        wallet: this._wallet,
      },
    });
  }

  onSearchCancel() {
    this.transactions = this.transactionsInitial;
  }

  onSearchChange(e) {
    const filteredTrans = this.transactionsInitial.filter(t => {
      return t.address.toLowerCase().indexOf(e.target.value.toLowerCase().toLowerCase()) > -1;
    });
    this.transactions = orderBy(filteredTrans, ['date'], 'desc');
  }

  onUpdatePrice(price) {
    this.selectedBalance = price;
  }

  async openTransaction({ ticker, address, amount, type, hash }, wallet: Wallet) {
    const makeMsg = (
      type: number,
      amount: number,
      ticker: string,
      address: string,
      decimal: number,
    ) => {
      const balance = BalancePipe.prototype.transform(amount, ticker, wallet.type, decimal);
      const sent = `${this.$.instant(
        this.$.YOU_HAVE_SENT,
      )} <strong>${balance} ${ticker}</strong> <br /><br />${this.$.instant(
        this.$.DESTINATION_ADDRESS,
      )}: <br /> <small>${address}</small>`;
      const received = `${this.$.instant(
        this.$.YOU_HAVE_RECEIVED,
      )} <strong>${balance} ${ticker}</strong> <br /><br /> ${this.$.instant(
        this.$.SOURCE_ADDRESS,
      )}: <br /> <small>${address}</small>`;

      return !!type ? received : sent;
    };
    const alert = await this.alertController.create({
      message: makeMsg(type, amount, ticker, address, this._wallet.decimal),
      buttons: [
        {
          text: this.$.instant(this.$.EXPLORER),
          cssClass: 'danger',
          handler: () => {
            const coinType = wallet.type;
            const explorer = this.networkService.getCoinExplorers(ticker, coinType);
            if (this.utilsService.isValidType(coinType) && !!explorer && explorer.length > 0) {
              Browser.open({
                url: `${explorer[0].url}/tx/${hash}`.replace(/\/\//g, '/'),
              });
            } else {
              this.utilsService.showToast(this.$.instant(this.$.UPDATED_SOON));
            }
          },
        },
        {
          text: this.$.instant(this.$.COPY_ADDRESS),
          handler: () => this.copy(address),
        },
        {
          text: this.$.instant(this.$.OK),
        },
      ],
    });
    await alert.present();
  }

  pushTransactions(txs: Transaction[], reset = false) {
    let t = txs;
    if (!reset) {
      const fltr = txs.filter(
        e =>
          this._transactions.value.findIndex(
            ee => e.hash === ee.hash && e.confirmed !== ee.confirmed,
          ) > -1,
      );
      if (!!fltr.length) {
        fltr.forEach(e => {
          const idx = this._transactions.value.findIndex(ee => ee.hash === e.hash);
          if (idx > -1) {
            this._transactions.value[idx].confirmed = e.confirmed;
            this._transactions.value[idx].date = e.date;
            this._transactions.value[idx].block = e.block;
          }
        });
      }
      t = this._transactions.value.concat(
        txs.filter(e => this._transactions.value.findIndex(ee => ee.hash === e.hash) === -1),
      );
    }
    t = sortBy(t, 'unix').reverse();
    t = t.splice(0, t.length > 20 ? 20 : t.length);
    this._transactions.next(t);
  }

  openTransactions() {
    this.router.navigate(['transactions'], {
      state: {
        transactions: this._transactions.value,
        wallet: this._wallet,
      },
      relativeTo: this.route.parent,
    });
  }

  getTxTokenType(tx: Transaction): WalletType {
    switch (this._wallet.type) {
      default:
        return this._wallet.type;
      case WalletType.SOLANA: {
        const w = this._wallets.find(
          e =>
            e.type === WalletType.SOLANA_TOKEN && e.transactions?.find(ee => ee.hash === tx.hash),
        );
        return !w ? WalletType.SOLANA : w.type;
      }
      case WalletType.SOLANA_DEV: {
        const w = this._wallets.find(
          e =>
            e.type === WalletType.SOLANA_TOKEN_DEV &&
            e.transactions?.find(ee => ee.hash === tx.hash),
        );
        return !w ? WalletType.SOLANA_DEV : w.type;
      }
      case WalletType.ETH: {
        const w = this._wallets.find(
          e => e.type === WalletType.ETH_TOKEN && e.transactions?.find(ee => ee.hash === tx.hash),
        );
        return !w ? WalletType.ETH : w.type;
      }
      case WalletType.BSC: {
        const w = this._wallets.find(
          e => e.type === WalletType.BSC_TOKEN && e.transactions?.find(ee => ee.hash === tx.hash),
        );
        return !w ? WalletType.BSC : w.type;
      }
    }
  }

  async onScroll(height: number) {
    const isScreenBigEnoughNotToHideHeader =
      window.outerHeight >
      this.header.nativeElement.clientHeight + this.transactionsElem.nativeElement.clientHeight;

    if (!isScreenBigEnoughNotToHideHeader) {
      if (this.pageComponent.isOpen) {
        await this.hide();
      } else {
        await this.display();
      }
    } else {
      await this.display();
    }
  }

  async presentCreateTokenAccountPrompt() {
    if (UtilsService.isSolanaToken(this._wallet.type)) {
      const minimumRent = await this.backendService.solana.getMinimumRentExemption({
        api: this._wallet.api,
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

              const solWallet = this._wallets.find(
                e => e.ticker === coinNames.SOL && UtilsService.isSolana(e.type),
              );
              if (
                !solWallet ||
                (minimumRent > solWallet.balance && !UtilsService.isSolanaDev(this._wallet.type))
              ) {
                const errorMsg = this.instant(this.$.CREATE_NEW_SOLANA_TOKEN_ACCOUNT_ERROR);
                throw new Error(
                  errorMsg.replace(
                    '<value>',
                    pipeAmount(
                      minimumRent,
                      this._wallet.ticker,
                      this._wallet.type,
                      this._wallet.decimal,
                      true,
                    ).toString(),
                  ),
                );
              }
              await this.presentLoading(this.$.INITIALIZING_TOKEN);
              this.backendService.solana
                .createTokenAddress({
                  address: this._wallet.mainAddress,
                  api: this._wallet.api,
                  contractAddress: this._wallet.contractaddress,
                  seeds: this.io.decrypt(this._wallet.mnemo, idt),
                  addressType: this._wallet.addressType,
                })
                .then(_ => {
                  this.checker.checkTransactions(
                    {
                      wallets: [this._wallet],
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
      const minimumRent = await this.backendService.safecoin.getMinimumRentExemption({
        api: this._wallet.api,
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

              const safeWallet = this._wallets.find(
                e => e.ticker === coinNames.SAFE && Utils.isSafecoin(e.type),
              );
              if (!safeWallet || minimumRent > safeWallet.balance) {
                const errorMsg = this.instant(this.$.CREATE_NEW_SAFE_TOKEN_ACCOUNT_ERROR);
                throw new Error(
                  errorMsg.replace(
                    '<value>',
                    pipeAmount(
                      minimumRent,
                      this._wallet.ticker,
                      this._wallet.type,
                      this._wallet.decimal,
                      true,
                    ).toString(),
                  ),
                );
              }
              await this.presentLoading(this.$.INITIALIZING_TOKEN);
              this.backendService.safecoin
                .createTokenAddress({
                  address: this._wallet.mainAddress,
                  api: this._wallet.api,
                  contractAddress: this._wallet.contractaddress,
                  seeds: this.io.decrypt(this._wallet.mnemo, idt),
                  addressType: this._wallet.addressType,
                })
                .then(_ => {
                  this.checker.checkTransactions(
                    {
                      wallets: [this._wallet],
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

  get totalBalance(): number {
    return this.makeTotalBalance(this._wallet);
  }

  get totalCoinBalance(): number {
    if (!this._wallet) return 0;
    const { balance } = this._wallet;
    return balance;
  }

  get isInitialized() {
    if (!(UtilsService.isSolanaToken(this._wallet.type) || Utils.isSafecoinToken(this._wallet.type))) {
      return true;
    } else {
      return this._wallet.isInitialized;
    }
  }

  // private _loadWalletHistory(wallet: Wallet): Promise<WalletHistory[]> {
  //   return this.history
  //     .loadWalletHistory(wallet)
  //     .then(history => this.pushWalletHistory(history, true))
  //     .then(([_, history]) => history);
  // }

  // private _pushNews(news: NewsItem[]): NewsItem[] {
  //   // const n = this.newsPage === 1 ? news : this._shadowNews.concat(news);

  //   if (this.newsPage === 1) {
  //     // this.newsProvider.pushNewsValue(this._wallet.ticker, news);
  //   }

  //   // this._news.next(n);

  //   this._canLoadNews = news.length === this.news.PAGE_SIZE;
  //   this.newsPage += 1;

  //   return news;
  // }

  // loadNews(e?) {
  //   // TODO Enable news
  //   // if (!this._canLoadNews) return;
  //   // else this._loadNews().then(() => e?.complete());
  // }

  // private _loadNews() {
  //   this._isLoadingNews.next(true);

  //   return this.authz
  //     .access()
  //     .then(({ access_token }) => this.news.load({ ticker: this._wallet.ticker, page: this.newsPage }, access_token))
  //     .then(news => this._pushNews(news))
  //     .catch(console.error)
  //     .then(() => this._isLoadingNews.next(false));
  // }

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

  private makeTotalBalance(wallet: Wallet): number {
    return (
      pipeAmount(wallet.balance, wallet.ticker, wallet.type, wallet.decimal, true) *
      this.getPrice(wallet.ticker, this.currency)
    );
  }

  private async _isRead(cache: CacheWallet) {
    if (cache) {
      // await this.cacheService.updateCache(cache._uuid, {
      //   newtx: false
      // });
    }
  }

  private async hide() {
    if (this.displayTopHeader) {
      this.displayTopHeader = false;
      this.showAnimation.stop();
      this.hideAnimation.play();

      this.hideAnimation2.stop();
      await this.showAnimation2.play();
    }
  }

  private async display() {
    if (!this.displayTopHeader) {
      this.displayTopHeader = true;
      this.hideAnimation.stop();
      this.showAnimation.play();

      this.showAnimation2.stop();
      await this.hideAnimation2.play();
    }
  }
}
