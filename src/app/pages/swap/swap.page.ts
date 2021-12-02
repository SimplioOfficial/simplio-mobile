import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

import { BehaviorSubject, combineLatest, Subscription } from 'rxjs';
import { filter, map, startWith } from 'rxjs/operators';
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
import { UtilsService } from 'src/app/services/utils.service';
import { TrackedPage } from '../../classes/trackedPage';
import { flatten } from 'lodash';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';

const DEFAULTS = {
  currentPage: 0,
  isEmpty: false,
  isLoading: false,
  canLoad: true,
  isLoadingInit: false,
  isLoadingHistory: false,
  swapHistory: [],
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
    private utils: UtilsService,
    private plt: PlatformProvider,
    private authService: AuthenticationService,
  ) {
    super();
    this.subscription.add(this.swapProvider.allPendingSwaps$.subscribe(_ => this.loadData()));
    this.subscription.add(
      this.settingsProvider.notificationCount$.subscribe(count => (this.notificationCount = count)),
    );
  }
  readonly swapStatusTranslations = getSwapStatusTranslations(this.$);

  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

  currency = this.settingsProvider.settingsValue.currency;
  locale = this.settingsProvider.settingsValue.language;
  mode = this.settingsProvider.settingsValue.theme.mode;
  feePolicy = this.settingsProvider.settingsValue.feePolicy;

  currentPage = DEFAULTS.currentPage;
  isEmpty = DEFAULTS.isEmpty;
  isLoading = DEFAULTS.isLoading;

  private _canLoad = new BehaviorSubject(DEFAULTS.canLoad);
  canLoad$ = this._canLoad.asObservable();

  private _isLoadingInit = new BehaviorSubject<boolean>(DEFAULTS.isLoadingInit);
  isLoadingInit$ = this._isLoadingInit.asObservable();
  private _isLoadingHistory = new BehaviorSubject(DEFAULTS.isLoadingHistory);
  isLoadingHistory$ = this._isLoadingHistory.asObservable();

  private _swapHistory = new BehaviorSubject<SwapReportPage[]>(DEFAULTS.swapHistory);

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

  isEmpty$ = combineLatest([this.pendingSwaps$, this.swapHistory$]).pipe(
    map(([p, h]) => [!!p.length, !!h.length]),
    map(v => v.every((val: boolean) => !val)),
    map(v => !v),
  );

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

  loadData(clean = false): Promise<[SwapReportPage, SwapReportPage]> {
    if (clean) this._setDefaults();
    return Promise.all([
      this._fetchSwapHistory({ pageNumber: this._nextPage, clean }),
      this._fetchPendingSwaps(clean),
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

  async openSettings() {
    await this.router.navigate(['/home', 'user'], {
      state: {
        origin: this.location.path(),
      },
    });
  }
}
