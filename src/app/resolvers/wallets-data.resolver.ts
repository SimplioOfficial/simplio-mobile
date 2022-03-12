import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { Wallet, WalletsData } from 'src/app/interface/data';
import { SettingsProvider } from 'src/app/providers/data/settings.provider';
import { WalletsProvider } from 'src/app/providers/data/wallets.provider';
import { coinNames } from '@simplio/backend/api/utils/coins';

@Injectable({
  providedIn: 'root',
})
export class WalletsDataResolver implements Resolve<any> {
  constructor(
    private settingsProvider: SettingsProvider,
    private walletsProvider: WalletsProvider,
  ) {}
  wallets: Wallet[] = this.walletsProvider.walletsValue;

  static find(wallets: Wallet[] = [], id: string = ''): Wallet | null {
    return wallets.find(w => w._uuid === id || w.name === id) || null;
  }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<WalletsData> | WalletsData {
    return {
      wallets: this.wallets,
      primaryWallet: this._getPrimaryWallet(route, this.wallets),
    };
  }

  private _getPrimaryWallet(route: ActivatedRouteSnapshot, wallets: Wallet[]): Wallet | null {
    if (!wallets.length) return null;

    const overviewWallet = WalletsDataResolver.find(wallets, route.queryParams?.overview ?? '');
    const sioWallet = wallets.find(w => w.ticker === coinNames.SIO);
    const favoriteWallet = WalletsDataResolver.find(
      wallets,
      this.settingsProvider.settingsValue?.primaryWallet || '',
    );
    const firstWallet = wallets[0];

    return [overviewWallet, favoriteWallet, sioWallet, firstWallet].find(w => !!w);
  }
}
