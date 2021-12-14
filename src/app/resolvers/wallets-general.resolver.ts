import { Injectable } from '@angular/core';
import { SettingsProvider } from 'src/app/providers/data/settings.provider';
import { WalletsProvider } from 'src/app/providers/data/wallets.provider';
import { WalletsResolver } from 'src/app/resolvers/wallets.resolver';

@Injectable({
  providedIn: 'root',
})
export class WalletsGeneralResolver extends WalletsResolver {

  wallets = this.walletsProvider.walletsValue.filter(w => w.isInitialized);

  constructor(
    protected settingsProvider: SettingsProvider,
    private walletsProvider: WalletsProvider,
  ) {
    super(settingsProvider);
  }

}
