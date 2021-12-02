import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UtilsService } from 'src/app/services/utils.service';
import { coinsRemoved, CoinItem, customCoins } from 'src/assets/json/coinlist';
import { WalletsProvider } from 'src/app/providers/data/wallets.provider';
import { Translate } from 'src/app/providers/translate/';
import { BehaviorSubject, combineLatest, of } from 'rxjs';
import { searchBy } from 'src/app/services/wallets/utils';
import { map, switchMap } from 'rxjs/operators';
import { NameWalletPageRouterState } from 'src/app/pages/wallets/name-wallet/name-wallet.page';
import { Location } from '@angular/common';
import { AesService } from 'src/app/services/aes.service';
import { AuthenticationProvider } from 'src/app/providers/data/authentication.provider';
import { Wallet, WalletType } from 'src/app/interface/data';
import { CoinsService } from 'src/app/services/apiv2/connection/coins.service';

@Component({
  selector: 'add-wallet',
  templateUrl: './add-wallet.page.html',
  styleUrls: ['./add-wallet.page.scss'],
})
export class AddWalletPage {
  customCoins: CoinItem[] = customCoins;
  private _searched = new BehaviorSubject<string>('');

  customCoins$ = combineLatest([
    of(customCoins).pipe(map(coin => coin)),
    this.walletsProvider.allWallets$,
    this.coinsService.promoData$,
  ]).pipe(
    map(([coins, wallets, promo]) => {
      const msed = this.walletsProvider.masterSeedValue;
      const { idt } = this.authProvider.accountValue;
      const w = wallets.filter(w => this.compare(w.mnemo, msed.sed, idt));
      return [coins.concat(promo), w];
    }),
    map<[CoinItem[], Wallet[]], CoinItem[]>(([coins, w]) => {
      return coins.reduce((acc, curr) => {
        const exist = w.find(
          e =>
            e.ticker.toLowerCase() === curr.ticker?.toLowerCase() &&
            (e.type === curr.type || e.type === WalletType.UNKNOWN),
        );
        const removed = coinsRemoved.includes(curr.ticker?.toUpperCase());
        if (exist || removed) return acc;
        else return [...acc, curr];
      }, []);
    }),
    map(w => UtilsService.sortByName(w)),
  );

  searchedCustomCoins$ = this._searched.pipe(
    switchMap(input =>
      this.customCoins$.pipe(
        map(coins =>
          searchBy<CoinItem>(coins, 'name', 'ticker', 'contractAddress', 'origin')(input),
        ),
      ),
    ),
  );

  coins$ = combineLatest([
    this.walletsProvider.allWallets$,
    this.coinsService.coinsData$,
    this.customCoins$,
  ]).pipe(
    map(([wallets, coins, customCoins]) => {
      const msed = this.walletsProvider.masterSeedValue;
      const { idt } = this.authProvider.accountValue;
      const w = wallets.filter(w => this.compare(w.mnemo, msed.sed, idt));
      return [
        coins.filter(e => !customCoins.find(ee => ee.ticker === e.ticker && ee.type === e.type)),
        w,
      ];
    }),
    map<[CoinItem[], Wallet[]], CoinItem[]>(([coins, w]) => {
      return coins.reduce((acc, curr) => {
        const exist = w.find(
          e =>
            e.ticker.toLowerCase() === curr.ticker?.toLowerCase() &&
            (e.type === curr.type || e.type === WalletType.UNKNOWN),
        );
        const removed = coinsRemoved.includes(curr.ticker?.toUpperCase());
        if (exist || removed) return acc;
        else return [...acc, curr];
      }, []);
    }),
    map(w => UtilsService.sortByName(w)),
  );

  searchedCoins$ = this._searched.pipe(
    switchMap(input =>
      this.coins$.pipe(
        map(coins =>
          searchBy<CoinItem>(coins, 'name', 'ticker', 'contractAddress', 'origin')(input),
        ),
      ),
    ),
  );

  constructor(
    private router: Router,
    private utilsService: UtilsService,
    private walletsProvider: WalletsProvider,
    private location: Location,
    private aesService: AesService,
    private authProvider: AuthenticationProvider,
    private coinsService: CoinsService,
    public $: Translate,
  ) {
    this.coinsService.init();
  }

  private compare(s1, s2, p) {
    const decrypted = this.aesService.decryptString(s1, p);
    return decrypted === s2;
  }

  onSearchChange(event) {
    const { value } = event.target;
    this._searched.next(value);
  }

  onSearchFocus([focusState]) {
    if (!focusState) this._searched.next('');
  }

  selectCoin(coin: CoinItem) {
    const wallets = this.walletsProvider.walletsValue;
    const typeWallets = wallets.filter(w => w.ticker === coin.ticker);

    if (typeWallets.length === this.walletsProvider.maximumWallet) {
      return this.utilsService.presentAlert({
        message: [this.$.YOU_HAVE_REACHED_THE_MAXIMUM_AMOUNT_OF_WALLETS_FOR, coin.ticker],
      });
    }

    const state: NameWalletPageRouterState = {
      url: this.location.path(),
      type: coin.type,
      name: coin.name,
    };

    switch (coin.type) {
      case WalletType.CUSTOM_TOKEN:
        return this.router.navigate(['home', 'wallets', 'add', 'custom', coin.ticker], { state });
      default:
        return this.router.navigate(['home', 'wallets', 'add', coin.ticker], { state });
    }
  }
}
