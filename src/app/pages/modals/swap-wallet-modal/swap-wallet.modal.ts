import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { WalletService } from 'src/app/services/wallet.service';
import { Rate, Wallet } from 'src/app/interface/data';
import { pipeAmount, UtilsService } from 'src/app/services/utils.service';
import { Translate } from 'src/app/providers/translate/';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, filter, skip } from 'rxjs/operators';
import { pairWallet, getAllowedWallets, getCurrencyNetwork } from 'src/app/services/swap/utils';
import { getPrice } from 'src/app/services/wallets/utils';

export type SwapWalletModalResponse = {
  isValid: boolean;
  sourceWallet: Wallet;
  destinationWallet: Wallet;
};

@Component({
  selector: 'swap-wallet-modal',
  templateUrl: './swap-wallet.modal.html',
  styleUrls: ['./swap-wallet.modal.scss'],
})
export class SwapWalletModal implements OnInit {
  private _subscription = new Subscription();

  canProceed = false;
  filteredWallets: Wallet[] = [];
  state = true;

  isSwapped: BehaviorSubject<boolean> = new BehaviorSubject(false);

  @Input() private source: Wallet | null = null;
  @Input() private destination: Wallet | null = null;

  @Input() rates: Rate[] = [];
  @Input() currency = 'usd'; // @todo set a global default value
  @Input() wallets: Wallet[] = [];
  @Input() list: any[] = [];

  private _sourceWallet: BehaviorSubject<Wallet> = new BehaviorSubject(null);
  sourceWallet$: Observable<Wallet> = this._sourceWallet.asObservable();
  private _destinationWallet: BehaviorSubject<Wallet> = new BehaviorSubject(null);
  destinationWallet$: Observable<Wallet> = this._destinationWallet.asObservable();

  get sourceWalletFiatValue(): number {
    const currentSourceWallet = this._sourceWallet.value;
    return this.getWalletFiatValue(currentSourceWallet);
  }

  get destinationWalletFiatValue(): number {
    const currentDestinationWallet = this._destinationWallet.value;
    return this.getWalletFiatValue(currentDestinationWallet);
  }

  get title(): string {
    return this.state
      ? this.translateService.instant(this.$.CONVERT_TO)
      : this.translateService.instant(this.$.CONVERT_FROM);
  }

  get canSwap(): boolean {
    return !!(this._sourceWallet && this._destinationWallet);
  }

  constructor(
    private modalCtrl: ModalController,
    public utilsService: UtilsService,
    public $: Translate,
    private translateService: TranslateService,
  ) {}

  ngOnInit(): void {
    // Initial wallets values
    this._sourceWallet.next(this.source);
    this._destinationWallet.next(this.destination);

    const isSwappedSubscription = this.isSwapped
      .pipe(filter(w => !!w))
      .subscribe(this._onSwappedSubscription.bind(this));

    const sourceWalletSubscription = this.sourceWallet$
      .pipe(
        skip(1),
        filter(w => !!w),
        distinctUntilChanged(),
      )
      .subscribe(this._onSourceWalletSubscription.bind(this));

    const destinationWalletSubscription = this.destinationWallet$
      .pipe(filter(w => !!w))
      .subscribe(this._onDestinationWalletSubscription.bind(this));

    this._subscription.add(sourceWalletSubscription);
    this._subscription.add(destinationWalletSubscription);
    this._subscription.add(isSwappedSubscription);
  }

  onDismissModal(): void {
    const sourceWallet = this._sourceWallet.value;
    const destinationWallet = this._destinationWallet.value;
    const isValid = !!(sourceWallet && destinationWallet);

    const response: SwapWalletModalResponse = { isValid, sourceWallet, destinationWallet };
    this.modalCtrl.dismiss(response).then(() => this._subscription.unsubscribe());
  }

  private _onSourceWalletSubscription(wallet: Wallet): void {
    this._destinationWallet.next(null);
    const pairWallets = pairWallet(wallet, this.wallets, this.list);
    const filteredWallets = this.filterWallets(pairWallets, wallet, null);
    this.filteredWallets = UtilsService.sortByName(filteredWallets);
  }

  private _onDestinationWalletSubscription(wallet: Wallet): void {
    const currentSourceWallet = this._sourceWallet.value;
    const pairWallets = pairWallet(currentSourceWallet, this.wallets, this.list);
    const filteredWallets = this.filterWallets(pairWallets, currentSourceWallet, wallet);
    this.filteredWallets = UtilsService.sortByName(filteredWallets);
  }

  private _onSwappedSubscription(swapped: boolean): void {
    const currentSourceWallet = this._sourceWallet.value;
    const currentDestinationWallet = this._destinationWallet.value;

    const nextSourceWallet = swapped ? currentDestinationWallet : currentSourceWallet;
    const nextDestinationWallet = swapped ? currentSourceWallet : currentDestinationWallet;

    this._sourceWallet.next(nextSourceWallet);
    this._destinationWallet.next(nextDestinationWallet);

    const pairWallets = pairWallet(nextSourceWallet, this.wallets, this.list);
    const filteredWallets = this.filterWallets(
      pairWallets,
      nextSourceWallet,
      nextDestinationWallet,
    );
    this.filteredWallets = UtilsService.sortByName(filteredWallets);
  }

  filterWallets(wallets: Wallet[], sourceWallet: Wallet, destinationWallet: Wallet): Wallet[] {
    const exclude = (...walls: Wallet[]) =>
      wallets.filter(w => !walls.includes(w) && w.isInitialized);
    return exclude(sourceWallet, destinationWallet);
  }

  selectWallet(wallet: Wallet) {
    if (this.state) {
      this._destinationWallet.next(wallet);
    } else {
      this._sourceWallet.next(wallet);
      this._destinationWallet.next(null);
      this.changeSegment(true, wallet);
    }
  }

  changeSegment(state: boolean, sourceWallet?: Wallet) {
    this.state = state;
    const wallet = sourceWallet ?? this._sourceWallet.value;
    const filteredWallets = !state ? this._getAllowedPairs() : this._pairWallets(wallet);
    this.filteredWallets = UtilsService.sortByName(filteredWallets);
  }

  private _getAllowedPairs(): Wallet[] {
    const wallets = getAllowedWallets(this.wallets, this.list);
    return this.filterWallets(wallets, this._sourceWallet.value, this._destinationWallet.value);
  }

  private _pairWallets(sourceWallet): Wallet[] {
    const pairWallets = pairWallet(sourceWallet, this.wallets, this.list);
    return this.filterWallets(pairWallets, this._sourceWallet.value, this._destinationWallet.value);
  }

  swapWallets() {
    const s = this._sourceWallet.value;
    const d = this._destinationWallet.value;

    if (!!s && !!d) {
      const temp = this.list.filter(
        e =>
          e.SourceCurrency === d.ticker &&
          e.TargetCurrency === s.ticker &&
          e.SourceCurrencyNetwork === getCurrencyNetwork(d.type, d.ticker) &&
          e.TargetCurrencyNetwork === getCurrencyNetwork(s.type, s.ticker),
      );
      this.isSwapped.next(temp.length > 0);
    } else {
      this.isSwapped.next(false);
    }
  }

  getPrice(rates: Rate[], ticker: string, currency: string): number {
    return getPrice(rates, ticker, currency);
  }

  getWalletFiatValue(wallet: Wallet): number {
    if (!wallet) return 0;
    const pipe = pipeAmount(wallet.balance, wallet.ticker, wallet.type, wallet.decimal, true);
    return pipe * this.getPrice(this.rates, wallet.ticker, this.currency);
  }
}
