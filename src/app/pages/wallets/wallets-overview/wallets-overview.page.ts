import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { filter, map, pluck, skipWhile, takeWhile, tap } from 'rxjs/operators';
import { AnimationController, IonReorderGroup } from '@ionic/angular';
import { pipeAmount, UtilsService } from 'src/app/services/utils.service';
import { Rate, Wallet } from 'src/app/interface/data';
import { WalletService } from 'src/app/services/wallet.service';
import { SettingsProvider } from 'src/app/providers/data/settings.provider';
import { WalletsProvider } from 'src/app/providers/data/wallets.provider';
import { AuthenticationProvider } from 'src/app/providers/data/authentication.provider';
import { Translate } from 'src/app/providers/translate';
import { Settings } from 'src/app/interface/settings';
import { getPrice } from 'src/app/services/wallets/utils';
import { NotificationType } from 'src/app/components/list-items/sio-wallet-item/sio-wallet-item.component';
import { Action } from 'src/app/components/list-items/sio-action-item/sio-action-item.component';
import { MultiFactorAuthenticationService } from 'src/app/services/authentication/mfa.service';
import { CheckWalletsService } from 'src/app/services/wallets/check-wallets.service';
import { InitTutorialService } from 'src/app/services/tutorials/presenters/init-tutorial.service';
import { InitTutorialModal } from 'src/app/pages/modals/tutorials/init-tutorial-modal/init-tutorial.modal';
import { TutorialsProvider } from 'src/app/providers/data/tutorials.provider';
import { RateService } from 'src/app/services/apiv2/connection/rate.service';
import { Feev2Service } from 'src/app/services/apiv2/connection/feev2.service';
import { coinNames } from '../../../services/api/coins';
import { sortBy } from 'lodash';
import { SioPageComponent } from '../../../components/layout/sio-page/sio-page.component';
import { Animation } from '@ionic/core';

@Component({
  selector: 'wallets-overview-page',
  templateUrl: './wallets-overview.page.html',
  styleUrls: ['./wallets-overview.page.scss'],
})
export class WalletsOverviewPage implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(IonReorderGroup, { static: false }) reorderGroup: IonReorderGroup;
  @ViewChild('header', { static: false }) header: ElementRef<HTMLElement>;
  @ViewChild('scrollableHeader', { static: false }) scrollableHeader: ElementRef<HTMLElement>;
  @ViewChild('pageComponent', { static: false }) pageComponent: SioPageComponent;
  @ViewChild('reorderSection', { static: false }) reorderSection: ElementRef<HTMLElement>;

  currency = this.settingsProvider.settingsValue.currency;
  locale = this.settingsProvider.settingsValue.language;

  notificationCount = 0;
  displayTopHeader = true;
  selectedBalance = null;
  event: any;
  isBacked$ = this.walletsProvider.masterSeed$.pipe(pluck('bck'));
  tutorial$ = this.tutsProvider.tutorials$.pipe(
    takeWhile(tut => !tut.tutInit),
    tap(() => this.initTut.create(InitTutorialModal)),
  );
  private _wallets: Wallet[] = [];
  private _rates: Rate[] = [];
  rate$ = this.rateService.pureRate$.pipe(
    skipWhile(() => !this._wallets.length),
    filter(([s, _]) => !s),
    tap(([_, r]) => {
      this.walletService.getWalletsOf();
      this._rates = r;
    }),
  );
  private _isScrolling = new BehaviorSubject<boolean>(false);
  private _subscription = new Subscription();
  private _transactionErrors: Map<string, string[]> = new Map();
  private _isLoadingHistory = new BehaviorSubject(false);
  isLoadingHistory$ = this._isLoadingHistory.asObservable();
  private _loadHistory = new BehaviorSubject(false);
  private _isBackedAction: Action = {
    title: this.$.instant(this.$.ACTION_BACKUP_TITLE),
    subtitle: this.$.instant(this.$.ACTION_BACKUP_DESC),
    icon: 'lock-open-outline',
    color: 'primary',
    handler: async () => {
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

      if (!isVerified) return;

      await this.router.navigate(['/home', 'user', 'settings', 'backup'], {
        state: {
          url: this.location.path(),
        },
      });
    },
  };
  actions = [this._isBackedAction];

  wallets$: Observable<Wallet[]> = this.walletsProvider.wallets$.pipe(
    map(w => sortBy(w, '_p')),
    tap(w => (this._wallets = w)),
  );

  totalBalance$ = this.wallets$.pipe(
    map(wallets =>
      wallets.reduce((acc: number, currWall: Wallet) => {
        acc +=
          pipeAmount(currWall.balance, currWall.ticker, currWall.type, currWall.decimal, true) *
          this._getPrice(currWall.ticker);
        return acc;
      }, 0),
    ),
  );

  private hideAnimation: Animation;
  private showAnimation: Animation;
  private hideAnimation2: Animation;
  private showAnimation2: Animation;

  private readonly ANIMATION_DURATION = 100; // ms

  constructor(
    private router: Router,
    private location: Location,
    private rateService: RateService,
    private feeService: Feev2Service,
    private utilsService: UtilsService,
    private checker: CheckWalletsService,
    private initTut: InitTutorialService,
    private walletService: WalletService,
    private animCtrl: AnimationController,
    private tutsProvider: TutorialsProvider,
    private walletsProvider: WalletsProvider,
    private settingsProvider: SettingsProvider,
    private authProvider: AuthenticationProvider,
    private mfa: MultiFactorAuthenticationService,
    public $: Translate,
  ) {}

  get settings(): Settings {
    return this.settingsProvider.settingsValue;
  }

  get accentColor$(): Observable<string> {
    return this.settingsProvider.accentColor$;
  }

  get coinRate(): number {
    const curr = this.settings.currency;
    return (
      this.rateService.rateValue.find(r => r.code.toLowerCase() === curr.toLowerCase())?.rate ?? 1
    );
  }

  get btcPrice(): number {
    return (
      this.rateService.rateValue.find(r => r.code.toLowerCase() === coinNames.BTC.toLowerCase())
        ?.price ?? 1
    );
  }

  ngOnInit() {
    this._setChartColor();
    this.walletsProvider.pushWallet(null);
    // const platformMode = window.matchMedia('(prefers-color-scheme: dark)');
    // platformMode.addEventListener('change', () => this._setChartColor());

    const isCheckingSubscription$ = this.checker.isChecking$.subscribe(dat => {
      if (!dat && this.event) {
        this.event.target.complete();
      }
    });

    const newWallet = this.walletsProvider.newWallet$.subscribe(w => {
      if (!!w) {
        this.checker.checkTransactions({
          wallets: [w],
        });
        this.walletsProvider.pushNewWallet(null);
      }
    });
    this._subscription.add(this.rate$.subscribe());
    this._subscription.add(isCheckingSubscription$);
    this._subscription.add(this.tutorial$.subscribe());
    this._subscription.add(newWallet);
    this._subscription.add(
      this.settingsProvider.notificationCount$.subscribe(count => (this.notificationCount = count)),
    );
  }

  ngAfterViewInit(): void {
    const headerHeight = this.header.nativeElement.clientHeight;
    const scrollableHeaderHeight = this.scrollableHeader.nativeElement.clientHeight;

    this.hideAnimation = this.animCtrl
      .create('hideAnimation')
      .addElement(this.header.nativeElement)
      .duration(this.ANIMATION_DURATION)
      .keyframes([
        { offset: 0, transform: `translateY(0px)`, opacity: 1 },
        { offset: 1, transform: `translateY(-${headerHeight}px)`, opacity: 0 },
      ]);

    this.hideAnimation2 = this.animCtrl
      .create('hideAnimation2')
      .addElement(this.scrollableHeader.nativeElement)
      .duration(this.ANIMATION_DURATION)
      .keyframes([
        { offset: 0, top: `0px`, height: `${scrollableHeaderHeight}px` },
        {
          offset: 1,
          top: `-${headerHeight}px`,
          height: `${scrollableHeaderHeight - headerHeight}px`,
        },
      ])
      .beforeStyles({ position: 'relative' });

    this.showAnimation = this.animCtrl
      .create('showAnimation')
      .addElement(this.header.nativeElement)
      .duration(this.ANIMATION_DURATION)
      .keyframes([
        { offset: 0, transform: `translateY(-${headerHeight}px)`, opacity: 0 },
        { offset: 1, transform: `translateY(0)`, opacity: 1 },
      ]);

    this.showAnimation2 = this.animCtrl
      .create('showAnimation2')
      .addElement(this.scrollableHeader.nativeElement)
      .duration(this.ANIMATION_DURATION)
      .keyframes([
        {
          offset: 0,
          top: `-${headerHeight}px`,
          height: `${scrollableHeaderHeight - headerHeight}px`,
        },
        { offset: 1, top: `0px`, height: `${scrollableHeaderHeight}px` },
      ])
      .beforeStyles({ position: 'relative' });
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }

  doRefresh(event: any) {
    this.event = event;
    setTimeout(() => {
      event.detail.complete();
    }, 2000);
    this.checker.checkTransactionsAll(
      {
        wallets: this._wallets,
      },
      () => {
        this.rateService.refresh(false);
        this.feeService.refresh();
        event.detail.complete();
      },
    );
  }

  doReorder(event) {
    const { from, to, complete } = event;

    // UGLY but with better PERFORMANCE
    const updatedWallets: Wallet[] = [];
    let walletOrder = 1;
    this._wallets.forEach((wallet, index) => {
      if (index === from) {
        // do nothing
      } else if (index === to) {
        updatedWallets.push(this._wallets[from]);
        updatedWallets.push(this._wallets[index]);

        updatedWallets[walletOrder - 1]._p = walletOrder;
        updatedWallets[walletOrder]._p = walletOrder + 1;

        walletOrder += 2;
      } else {
        updatedWallets.push(this._wallets[index]);
        updatedWallets[walletOrder - 1]._p = walletOrder;
        walletOrder++;
      }
    });

    this._wallets = updatedWallets;

    complete();
  }

  doneReorderGroup() {
    this.walletService.updateWallets(this._wallets, () => {
      this.reorderGroup.disabled = true;
    });
  }

  getFiatValue(w: Wallet): number {
    return pipeAmount(w.balance, w.ticker, w.type, w.decimal, true) * this._getPrice(w.ticker);
  }

  getTransactionError(uuid: string) {
    const err = this._transactionErrors.get(uuid);
    if (err && err.length > 5) {
      return err[0];
    } else {
      return '';
    }
  }

  onLongPress(pressTime) {
    if (this._isScrolling.value) return;
    if (pressTime === 112) this._toggleReorderGroup(true);
  }

  onUpdatePrice(price) {
    this.selectedBalance = price;
  }

  async openWallet(wallet: Wallet) {
    if (!this.reorderGroup.disabled) return;

    this.walletsProvider.pushWallet(wallet);
    await this.router.navigate(['/home', 'wallets', wallet.name, 'overview']);
  }

  async openSettings() {
    await this.router.navigate(['/home', 'user'], {
      state: {
        origin: this.location.path(),
      },
    });
  }

  getNoticationType(wallet: Wallet): NotificationType {
    return this._wallets
      .filter(c => c && wallet && c._uuid === wallet._uuid)
      .filter((c, i) => (i === 0 ? c : []))
      .reduce((_, curr) => {
        if (curr.unconfirmed > 0) return NotificationType.UNCONFIRMED;
        return NotificationType.NONE;
      }, NotificationType.NONE);
  }

  setScrolling(state: boolean) {
    this._isScrolling.next(state);
  }

  async onScroll(height: number) {
    const isScreenBigEnoughNotToHideHeader =
      window.outerHeight > this.reorderSection.nativeElement.clientHeight + 203; // height if the unscrolled header
    if (!isScreenBigEnoughNotToHideHeader) {
      if (height < 100) {
        await this.hide();
      } else {
        await this.display();
      }
    } else {
      await this.display();
    }
  }

  private _getPrice(ticker: string) {
    return getPrice(this.rateService.rateValue, ticker, this.currency);
  }

  private _setChartColor() {
    const accentCol = window
      .getComputedStyle(document.body)
      .getPropertyValue('--ion-color-primary');
    this.settingsProvider.pushAccentColorHEX(accentCol);
  }

  private _toggleReorderGroup(state: boolean) {
    if (!this.reorderGroup) return;
    this.reorderGroup.disabled = !state;
  }

  private async hide() {
    if (this.displayTopHeader) {
      this.displayTopHeader = false;
      this.showAnimation.stop();
      this.hideAnimation.play();

      this.showAnimation2.stop();
      await this.hideAnimation2.play();
      // this.pageComponent.mainEl.scrollByPoint(0, this.header.nativeElement.clientHeight / 2, 100);
    }
  }

  private async display() {
    if (!this.displayTopHeader) {
      this.displayTopHeader = true;
      this.hideAnimation.stop();
      this.showAnimation.play();

      this.hideAnimation2.stop();
      await this.showAnimation2.play();
      // this.pageComponent.mainEl.scrollByPoint(0, -this.header.nativeElement.clientHeight / 2, 100);
    }
  }
}
