import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { Wallet, WalletsData } from 'src/app/interface/data';
import { SettingsProvider } from 'src/app/providers/data/settings.provider';
import { coinNames } from '../services/api/coins';

@Injectable({
  providedIn: 'root',
})
export class WalletsResolver implements Resolve<Observable<WalletsData> | WalletsData> {

  wallets: Wallet[] = [];

  constructor(
    protected settingsProvider: SettingsProvider,
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<WalletsData> | WalletsData {
    return {
      wallets: this.wallets,
      primaryWallet: this._getPrimaryWallet(route, this.wallets),
    };
  }

  private _getPrimaryWallet(route: ActivatedRouteSnapshot, wallets: Wallet[]): Wallet | null {
    if (!wallets.length) return null;

    const overviewWallet = this.find(route.queryParams?.overview ?? '');
    const sioWallet = wallets.find(w => w.ticker === coinNames.SIO);
    const favoriteWallet = this.find(this.settingsProvider.settingsValue?.primaryWallet || '');
    const firstWallet = wallets[0];

    return [overviewWallet, favoriteWallet, sioWallet, firstWallet].find(w => !!w);
  }

  find(id: string = ''): Wallet | null {
    return this.wallets.find(w => w._uuid === id || w.name === id) || null;
  }

}