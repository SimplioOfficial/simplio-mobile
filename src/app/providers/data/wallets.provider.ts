import { Injectable } from '@angular/core';
import { sortBy } from 'lodash';
import { BehaviorSubject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Address, History, MasterSeed, Wallet, WalletHistory } from 'src/app/interface/data';
import { WalletData } from 'src/app/providers/wallets/wallet-data';

const defaults = {
  missingWallet: [],
  wallets: [],
  wallet: null,
  primaryWallet: null,
  walletHistory: null,
  totalHistory: null,
  masterSeed: null,
  customMasterSeed: null,
};

@Injectable()
export class WalletsProvider {
  readonly maximumWallet: number = 5;
  readonly maximumAddress: number = 10;

  private _missingWallet = new BehaviorSubject<WalletData[]>(defaults.missingWallet);
  missingWallet$ = this._missingWallet.asObservable();

  private _newWallet = new BehaviorSubject<Wallet>(null);
  newWallet$ = this._newWallet.asObservable();

  private _wallets = new BehaviorSubject<Wallet[]>(defaults.wallets);
  allWallets$ = this._wallets.pipe(map(w => sortBy(w, 'name')));
  wallets$ = this.allWallets$.pipe(
    filter(w => Array.isArray(w)),
    map(w => w.filter(w => w.isActive)),
  );

  private _wallet = new BehaviorSubject<Wallet>(defaults.wallet);
  wallet$ = this._wallet.asObservable();

  private _primaryWallet = new BehaviorSubject<Wallet>(defaults.primaryWallet);
  primaryWallet$ = this._primaryWallet.asObservable();

  private walletHistory = new BehaviorSubject<WalletHistory[]>(defaults.walletHistory);
  walletHistory$ = this.walletHistory.asObservable();

  private totalHistory = new BehaviorSubject<History[]>(defaults.totalHistory);
  totalHistory$ = this.totalHistory.asObservable();

  private _masterSeed = new BehaviorSubject<MasterSeed>(defaults.masterSeed);
  masterSeed$ = this._masterSeed.asObservable();

  private _customMasterSeed = new BehaviorSubject<string>(defaults.customMasterSeed);

  private _rescanning = new BehaviorSubject<any>({ uuid: '', rescanning: false });
  rescanning$ = this._rescanning.asObservable();

  addressNames$ = this._wallets.pipe(
    map(wallets =>
      wallets.map(w => ({
        name: w.name,
        ticker: w.ticker,
        addresses: w.addresses.map((a: Address) => a.address),
      })),
    ),
    map(wallets =>
      wallets.reduce((acc, curr) => {
        curr.addresses.forEach(a => acc.set([a, curr.ticker].join('_'), curr.name));
        return acc;
      }, new Map<string, string>()),
    ),
  );

  clearHistory() {
    this.walletHistory.next([]);
    this.totalHistory.next([]);
  }

  pushMissingWallets(wallet: WalletData[]): WalletData[] {
    this._missingWallet.next(wallet);
    return wallet;
  }

  pushMasterSeed(msed: MasterSeed): MasterSeed {
    this._masterSeed.next(msed);
    return msed;
  }

  pushCustomMasterSeed(sed: string | Array<string>) {
    if (Array.isArray(sed)) this._customMasterSeed.next(sed.join(' '));
    else this._customMasterSeed.next(sed);
  }

  pushTotalHistory(history: History[]) {
    this.totalHistory.next(history);
  }

  pushWalletHistory(history: WalletHistory[]) {
    if (history && history.length === 1) {
      // flat is not a function on mobile
      // const doubled = Array.from(history, h => [h, h]).flat()
      history.push(history[0]);
      this.walletHistory.next(history);
    } else {
      this.walletHistory.next(history);
    }
  }

  pushWallets(wallets: Wallet[]): Wallet[] {
    this._wallets.next(wallets);
    return wallets;
  }

  pushWallet(wallet: Wallet): Wallet {
    this._wallet.next(wallet);
    return wallet;
  }

  pushNewWallet(wallet: Wallet): Wallet {
    this._newWallet.next(wallet);
    return wallet;
  }

  pushPrimaryWallet(wallet: Wallet): Wallet {
    this._primaryWallet.next(wallet);
    return wallet;
  }

  pushRescanning(uuid, rescanning: boolean): boolean {
    this._rescanning.next({ uuid, rescanning });
    return rescanning;
  }

  get walletHistoryValue(): WalletHistory[] {
    return this.walletHistory.value || [];
  }

  get walletsValue(): Wallet[] {
    const wallets = this._wallets.value || [];
    return wallets.filter(w => w.isActive);
  }

  get allWalletsValue(): Wallet[] {
    return this._wallets.value || [];
  }

  get walletValue(): Wallet {
    return this._wallet.value || undefined;
  }

  get primaryWalletValue(): Wallet {
    return this._primaryWallet.value;
  }

  get masterSeedValue(): MasterSeed {
    return this._masterSeed.value;
  }

  get customMasterSeedValue(): string {
    return this._customMasterSeed.value;
  }

  clean() {
    this._masterSeed.next(defaults.masterSeed);
    this._wallet.next(defaults.wallet);
    this._wallets.next(defaults.wallets);
    this._customMasterSeed.next(defaults.customMasterSeed);
    this._missingWallet.next(defaults.missingWallet);
  }
}
