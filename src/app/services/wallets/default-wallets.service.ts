import { Injectable } from '@angular/core';
import { sortBy } from 'lodash';
import { Wallet } from 'src/app/interface/data';
import { Acc } from 'src/app/interface/user';
import { defaultWallets, DefaultWalletFactory } from 'src/app/providers/wallets/default-wallets';
import { WalletData } from 'src/app/providers/wallets/wallet-data';
import { createDefaultWalletData } from 'src/app/services/wallets/utils';

@Injectable({
  providedIn: 'root',
})
export class DefaultWalletService {
  private readonly wallets = sortBy(defaultWallets, 'ticker');
  readonly walletsFactories = this.wallets.reduce((acc, curr) => {
    return acc.set(curr.ticker.toLowerCase(), curr);
  }, new Map<string, DefaultWalletFactory>());

  getFactories(wallets: Wallet[]): Array<DefaultWalletFactory> {
    return this.wallets.reduce((acc, curr) => {
      const exists = !!wallets.find(w => w.ticker === curr.ticker);

      if (exists) return acc;
      else acc.push(curr);
      return acc;
    }, []);
  }

  getWallets(account: Acc, wallets: Wallet[]): [boolean, WalletData[]] {
    const w = this.getFactories(wallets).map((f, i) => {
      const wd = this.createWalletData(account, f);
      const defaultWalletPosition = Object.keys(defaultWallets).findIndex(
        b => defaultWallets[b].ticker === f.ticker,
      );
      return wd.setPosition(defaultWalletPosition);
    });
    return [!!w.length, w];
  }

  createWalletData(account: Acc, defaultWallet: DefaultWalletFactory): WalletData {
    return createDefaultWalletData(account, defaultWallet);
  }
}
