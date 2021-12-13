import { Injectable } from '@angular/core';
import { SettingsProvider } from 'src/app/providers/data/settings.provider';
import { WalletsProvider } from 'src/app/providers/data/wallets.provider';
import { WalletsResolver } from 'src/app/resolvers/wallets.resolver';
import { isErcCoin, isErcToken, isSolana, isToken } from 'src/app/services/utils.service';

@Injectable({
  providedIn: 'root',
})

export class WalletsStakeResolver extends WalletsResolver {

  constructor(
    protected settingsProvider: SettingsProvider,
    protected walletsProvider: WalletsProvider,
  ) {
    super(
      settingsProvider, 
      walletsProvider.walletsValue.filter(w => 
        isToken(w.type) ||
        isSolana(w.type) ||
        isErcCoin(w.type) ||
        isErcToken(w.type)
      )
    );
  }

}
