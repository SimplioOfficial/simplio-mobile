import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { flatten } from 'lodash';

import { BehaviorSubject, combineLatest, Subscription } from 'rxjs';
import { filter, map, skipWhile, startWith } from 'rxjs/operators';
import { IonInfiniteScroll, ModalController } from '@ionic/angular';

import { Translate } from 'src/app/providers/translate';
import { SwapReportPage, SwapStatusText, SwapReportItem } from 'src/app/interface/swap';
import { SwapDetailModal } from 'src/app/pages/modals/swap-detail-modal/swap-detail.modal';
import { SettingsProvider } from 'src/app/providers/data/settings.provider';
import { SwapProvider } from 'src/app/providers/data/swap.provider';
import { WalletsProvider } from 'src/app/providers/data/wallets.provider';
import { IdentityVerificationError } from 'src/app/providers/errors/identity-verification-error';
import { PlatformProvider } from 'src/app/providers/platform/platform';

import { SingleSwapService } from 'src/app/services/swap/single-swap.service';
import { getSwapStatusTranslations } from 'src/app/services/swap/utils';
import { calculateInterest, UtilsService } from 'src/app/services/utils.service';
import { TrackedPage } from '../../classes/trackedPage';
import { OrdersResponse } from '../../interface/swipelux';
import { TransactionsProvider } from '../../providers/data/transactions.provider';
import { SwipeluxService } from '../../services/swipelux/swipelux.service';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { Transaction, TxType, Wallet, WalletType } from 'src/app/interface/data';
import { BackendService } from 'src/app/services/apiv2/blockchain/backend.service';
import { environment } from 'src/environments/environment';
import { AuthenticationProvider } from 'src/app/providers/data/authentication.provider';
import { IoService } from 'src/app/services/io.service';
import { coinNames } from 'src/app/services/api/coins';
import { Stake, Pool } from '@simplio/backend/interface/stake';
import { NetworkService } from 'src/app/services/apiv2/connection/network.service';
import { PurchaseDetailModal } from '../modals/purchase-detail-modal/purchase-detail.modal';

const DEFAULTS = {
  currentPage: 0,
  isEmpty: false,
  isLoading: false,
  canLoad: true,
  isLoadingInit: false,
  isLoadingHistory: false,
  swapHistory: [],
  purchases: [],
  stakingList: [],
};

@Component({
  selector: 'swap-page',
  templateUrl: './swap.page.html',
  styleUrls: ['./swap.page.scss'],
})
export class SwapPage extends TrackedPage implements OnInit, OnDestroy {
  private get _nextPage(): number {
    return this.currentPage + 1;
  }
  constructor(
    private router: Router,
    private location: Location,
    public $: Translate,
    private modalCtrl: ModalController,
    private settingsProvider: SettingsProvider,
    private walletsProvider: WalletsProvider,
    private swapProvider: SwapProvider,
    private singleSwap: SingleSwapService,
    private swipeluxService: SwipeluxService,
    private transactionProvider: TransactionsProvider,
    private utils: UtilsService,
    private plt: PlatformProvider,
    private authService: AuthenticationService,
    private backendService: BackendService,
    private authProvider: AuthenticationProvider,
    private io: IoService,
    private networkService: NetworkService,
  ) {
    super();
    this.subscription.add(this.swapProvider.allPendingSwaps$.subscribe(_ => this.loadData()));
    this.subscription.add(
      this.settingsProvider.notificationCount$.subscribe(count => (this.notificationCount = count)),
    );
  }
  readonly swapStatusTranslations = getSwapStatusTranslations(this.$);

  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

  wallets: Wallet[] = [];
  dummyStake = {
    amount: 1000,
    contractAddress: 'test',
    lastPayment: 200,
    poolAccount: 'What',
    stakingAccount: 'What',
    stakingOwner: 'Me',
    startTime: 0,
    withdrawAccount: 'Where',
  };

  segment = this.router.getCurrentNavigation().extras.state?.tab || 'swaps';
  currency = this.settingsProvider.settingsValue.currency;
  locale = this.settingsProvider.settingsValue.language;
  mode = this.settingsProvider.settingsValue.theme.mode;
  feePolicy = this.settingsProvider.settingsValue.feePolicy;

  currentPage = DEFAULTS.currentPage;
  isEmpty = DEFAULTS.isEmpty;
  isLoading = DEFAULTS.isLoading;
  isGettingStake = DEFAULTS.isLoading;
  stakingWalletList = [{ name: coinNames.SIO, type: WalletType.SOLANA_TOKEN_DEV }];
  private _canLoad = new BehaviorSubject(DEFAULTS.canLoad);
  canLoad$ = this._canLoad.asObservable();

  private _isLoadingInit = new BehaviorSubject<boolean>(DEFAULTS.isLoadingInit);
  isLoadingInit$ = this._isLoadingInit.asObservable();
  private _isLoadingHistory = new BehaviorSubject(DEFAULTS.isLoadingHistory);
  isLoadingHistory$ = this._isLoadingHistory.asObservable();

  private _swapHistory = new BehaviorSubject<SwapReportPage[]>(DEFAULTS.swapHistory);
  private _stakingList = new BehaviorSubject<Stake[]>(DEFAULTS.stakingList);

  private startHistory = !!this.swapProvider.swapHistoryValue
    ? [this.swapProvider.swapHistoryValue]
    : [];
  swapHistory$ = this._swapHistory.pipe(
    filter(pages => !!pages),
    startWith(this.startHistory),
    map(pages => pages.sort((a, b) => a.MetaData.PageCount - b.MetaData.PageCount)),
    map(pages => pages.map(page => page.Items)),
    map(pages => flatten(pages)),
    map(pages => {
      if (pages.length >= 2) {
        pages.sort((a, b) => b.StartedAtUnixTime - a.StartedAtUnixTime);
      }
      return pages;
    }),
    map(pages =>
      pages.filter(
        (page, i, pagesArray) => pagesArray.findIndex(page2 => page2.SagaId === page.SagaId) === i,
      ),
    ),
  );
  private transactions = !!this.transactionProvider.transactionsValue
    ? this.transactionProvider.transactionsValue
    : [];

  private _purchases = new BehaviorSubject<OrdersResponse[]>(DEFAULTS.purchases);
  purchases$ = this._purchases.asObservable();

  pendingSwaps$ = this.swapProvider.pendingSwaps$.pipe(
    map(pages => {
      if (pages.length >= 2) {
        pages.sort((a, b) => b.StartedAtUnixTime - a.StartedAtUnixTime);
      }
      if (this.plt.isCordova) {
        return pages.filter(e => e.SagaId);
      } else {
        return pages;
      }
    }),
  );

  stakingWalletList$ = this._stakingList.pipe(
    skipWhile(v => !v),
    map(stakes => {
      return stakes.filter(e => !!e);
    }),
  );

  isEmpty$ = combineLatest([this.pendingSwaps$, this.swapHistory$, this.stakingWalletList$]).pipe(
    map(([p, h, s]) => [!!p.length, !!h.length, !!s.length]),
    map(v => v.every((val: boolean) => !val)),
    map(v => !v),
  );

  wallets$ = this.walletsProvider.wallets$.subscribe(async w => {
    this.wallets = w;
  });

  poolsInfo: Pool[];
  subscription = new Subscription();
  notificationCount = 0;

  addressNames$ = this.walletsProvider.addressNames$;

  // isLoaded = false;
  // currentSlidePage = 0;

  slideOpts = {
    // resistanceRatio: 0.1,
    // preventInteractionOnTransition: true,
    freeMode: true,
    slidesPerView: 'auto',
    // wrapperClass: 'pending-swaps-slider-wrapper'
    // spaceBetween: 20
  };

  walletInfo(contractAddress: string) {
    return this.wallets.find(e => e.contractaddress === contractAddress);
  }

  calculateEarn(s: Stake, w: Wallet) {
    const p = this.poolsInfo.find(e => e.mintAddress === w.contractaddress);
    return calculateInterest(
      s.lastPayment,
      Math.floor(Date.now() / 1000),
      s.amount,
      w.decimal,
      p.rate,
      p.tiers,
    );
  }

  ngOnInit() {
    this._isLoadingInit.next(true);
    this.loadData(true).then(_ => this._isLoadingInit.next(false));
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  onInfiniteScroll() {
    this._isLoadingHistory.next(true);
    this._fetchSwapHistory({ pageNumber: this._nextPage })
      .catch((err: IdentityVerificationError) => {
        console.error(err);
      })
      .then(() => this._completeInfinite())
      .then(() => this._isLoadingHistory.next(false));
  }

  private async _fetchSwapHistory(data: {
    pageNumber: number;
    clean?: boolean;
  }): Promise<SwapReportPage> {
    const d = { pageNumber: 1, clean: false, ...data };
    const statuses = [SwapStatusText.Completed, SwapStatusText.Failed, SwapStatusText.Expired];
    try {
      await this.authService.checkToken();
      const page = await this.singleSwap.report({
        pageNumber: d.pageNumber,
        swapStatus: statuses,
      });

      // fixes bug DEVELOPMENT-261 on  ios
      page.Items = page.Items.filter(a => statuses.indexOf(a.Status) > -1);

      this.currentPage = page.MetaData.PageNumber;
      this._canLoad.next(page.MetaData.HasNextPage);
      if (d.clean) this.pushHistory(page);
      else this.updateHistory(page);

      this._setInfinite(page.MetaData.IsLastPage);
      return page;
    } catch (err) {
      console.error(err);
      throw new Error(err);
    }
  }

  private async _fetchPendingSwaps(clean = true): Promise<SwapReportPage> {
    try {
      const query = [
        SwapStatusText.Validating,
        SwapStatusText.Pending,
        SwapStatusText.Swapping,
        SwapStatusText.Withdrawing,
      ];
      await this.authService.checkToken();
      const page = await this.singleSwap.report({
        pageNumber: 1,
        swapStatus: query,
      });

      if (clean) {
        this.pushPending(page);
      }

      return page;
    } catch (err) {
      console.error(err);
      throw new Error(err);
    }
  }

  private async _fetchTransactionHistory(data: {
    pageNumber: number;
    clean?: boolean;
  }): Promise<Transaction[]> {
    const d = { pageNumber: 1, clean: false, ...data };

    try {
      const res = await this.swipeluxService.getAllOrders({ pageNumber: d.pageNumber });

      if (!!res?.items) {
        const transactions: Transaction[] = res.items.map(a => ({
          _uuid: a.uid,
          type: TxType.RECEIVE,
          ticker: a.toCcy.a3,
          address: a.wallet,
          amount: a.toAmount,
          hash: '',
          unix: 0,
          date: `${a.createdAt}`,
          confirmed: true,
          block: 1,
        }));

        if (data.clean) {
          this.transactionProvider.pushTransactions({
            _uuid: '',
            data: transactions,
          });

          this._purchases.next(res.items);
        }

        return transactions;
      } else {
        return null;
      }
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  private async _getStaking(idt: string, wallet) {
    const seeds = this.io.decrypt(wallet.mnemo, idt);
    return this.backendService.stake.getAllStaking(seeds, environment.PROGRAM_ID, wallet.api);
  }

  private async _fetchStaking() {
    try {
      if (!this.isGettingStake) {
        this.isGettingStake = true;
        const { idt } = this.authProvider.accountValue;
        const promisesToMake = [];
        this.stakingWalletList.forEach(element => {
          const wallet = this.wallets.find(
            e => e.ticker === element.name && e.type === element.type,
          );
          if (!!wallet) {
            promisesToMake.push(this._getStaking(idt, wallet));
          }
        });
        return Promise.all(promisesToMake).then((res: Stake[]) => {
          const flat = res.flat().sort((a, b) => a.lastPayment - b.lastPayment);
          this.isGettingStake = false;
          this._stakingList.next(flat);
          return flat;
        });
      }
    } catch (err) {
      console.error(err);
      throw new Error(err);
    }
  }

  updateHistory(page: SwapReportPage): SwapReportPage {
    const { value } = this._swapHistory;
    const current = !!value ? value : [];
    const future = [...current, page];
    this._swapHistory.next(future);
    return page;
  }

  pushHistory(page: SwapReportPage): SwapReportPage {
    const cache = page.MetaData.IsFirstPage || !page.MetaData.PageCount;
    if (cache) this.swapProvider.pushSwapHistory(page);
    this._swapHistory.next([page]);
    return page;
  }

  pushPending(page: SwapReportPage): SwapReportPage {
    this.swapProvider.pushPendingSwaps(page.Items);
    return page;
  }

  loadData(
    clean = false,
  ): Promise<[SwapReportPage, SwapReportPage, Transaction[], Stake[], Pool[]]> {
    if (clean) this._setDefaults();
    return Promise.all([
      this._fetchSwapHistory({ pageNumber: this._nextPage, clean }),
      this._fetchPendingSwaps(clean),
      this._fetchTransactionHistory({ pageNumber: this._nextPage, clean }),
      this._fetchStaking(),
      this._getPoolsInfo(),
    ]);
  }

  doRefresh(e) {
    this.loadData(false)
      .catch(err => {
        console.error(err);
        this.utils.showToast(this.$.LOADING_DATA_ERROR, 1500, 'warning');
      })
      .then(() => e.target.complete());
  }

  async openDetail(swapTransaction: SwapReportItem): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: SwapDetailModal,
      componentProps: { swapTx: swapTransaction },
      swipeToClose: true,
      cssClass: 'slide-modal',
      mode: 'ios',
    });
    await modal.present();

    const { data: refresh } = await modal.onWillDismiss();
    if (!refresh) return;

    await this._fetchPendingSwaps();
  }

  private _setInfinite(status) {
    if (!this.infiniteScroll) return;
    this.infiniteScroll.disabled = status;
  }

  private _completeInfinite() {
    if (!this.infiniteScroll) return;
    this.infiniteScroll.complete();
  }

  private _setDefaults() {
    this._canLoad.next(DEFAULTS.canLoad);
    this.currentPage = DEFAULTS.currentPage;
    this.isEmpty = DEFAULTS.isEmpty;
    this.isLoading = DEFAULTS.isLoading;
  }

  private async _getPoolsInfo() {
    const data: any = await this.networkService.get(environment.POOLS_INFO + 'poolsinfo');
    this.poolsInfo = JSON.parse(this.io.decrypt(data.result, environment.DATA_PASSWORD));
    return this.poolsInfo;
  }

  async openSettings() {
    await this.router.navigate(['/home', 'user'], {
      state: {
        origin: this.location.path(),
      },
    });
  }

  async openPurchaseDetail(purchase: OrdersResponse): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: PurchaseDetailModal,
      componentProps: { purchase },
      swipeToClose: true,
      cssClass: 'slide-modal',
      mode: 'ios',
    });
    await modal.present();

    const { data: refresh } = await modal.onWillDismiss();
    if (!refresh) return;
  }

  async openStakeDetails(s: Stake, w: Wallet) {
    await this.router.navigate(['/home', 'stake', 'details'], {
      state: {
        origin: this.location.path(),
        wallet: w,
        stake: s,
        earned: this.calculateEarn(s, w),
        pool: this.poolsInfo.find(e => e.mintAddress === w.contractaddress),
      },
    });
  }
}
