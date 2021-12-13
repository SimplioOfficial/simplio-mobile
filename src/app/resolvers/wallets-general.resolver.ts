import { Injectable } from '@angular/core';
import { SettingsProvider } from 'src/app/providers/data/settings.provider';
import { WalletsProvider } from 'src/app/providers/data/wallets.provider';
import { WalletsResolver } from 'src/app/resolvers/wallets.resolver';

@Injectable({
  providedIn: 'root',
})
export class WalletsGeneralResolver extends WalletsResolver {
  constructor(
    protected settingsProvider: SettingsProvider,
    protected walletsProvider: WalletsProvider,
  ) {
    super(
      settingsProvider, 
      walletsProvider.walletsValue.filter(w => w.isInitialized),
    );
  }

}
