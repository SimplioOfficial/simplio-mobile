import { Injectable } from '@angular/core';
import { WalletService } from '../wallet.service';
import { IoService } from '../io.service';
import { TxRefreshInterval, FeeName, SupportedFiat } from 'src/app/interface/data';
import { AuthenticationProvider } from 'src/app/providers/data/authentication.provider';
import { WalletsProvider } from 'src/app/providers/data/wallets.provider';
import { SettingsProvider } from 'src/app/providers/data/settings.provider';
import { Settings, AccentColor, ThemeMode, ChartView } from 'src/app/interface/settings';
import { UserID } from 'src/app/interface/global';
import { findPrimaryWallet } from 'src/app/services/wallets/utils';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  constructor(
    private io: IoService,
    private authProvider: AuthenticationProvider,
    private walletsProvider: WalletsProvider,
    private settingsProvider: SettingsProvider,
  ) {}

  createDefaultSettings(id: UserID): Settings {
    return Object.seal<Settings>({
      uid: id,
      currency: 'USD',
      feePolicy: FeeName.NORMAL,
      refresh: TxRefreshInterval.Default,
      language: 'en',
      primaryWallet: null,
      theme: Object.seal({
        accent: AccentColor.default,
        mode: ThemeMode.light,
      }),
      graph: Object.seal({
        enableGraph: true,
        period: ChartView.Month,
      }),
    });
  }

  /**
   * Saving settings into db and memory
   * A provided object can be a partial
   */
  private _save(partialSettings: Partial<Settings>): Promise<Settings> {
    const { uid } = this.authProvider.accountValue;
    const finalSettings: Settings = {
      ...this.settingsProvider.settingsValue,
      ...partialSettings,
    };
    return this.io
      .updateSettings(uid, finalSettings)
      .then(s => this.settingsProvider.pushSettings(s));
  }

  readSettings(uid: UserID): void {
    const settings = this.io.readSettings(uid);
    const wallets = this.walletsProvider.walletsValue;
    const primaryWallet = findPrimaryWallet(wallets, settings?.primaryWallet);
    this.settingsProvider.pushSettings({
      ...settings,
      primaryWallet: primaryWallet?.name,
      feePolicy: settings?.feePolicy ?? FeeName.NORMAL,
      refresh: settings?.refresh ?? TxRefreshInterval.Default,
    });
  }

  /**
   * update settings with a partial
   * settings object
   */
  updateSettings(partialSettings: Partial<Settings>): Promise<Settings> {
    return this._save(partialSettings);
  }

  /**
   *
   * @note future version wont have accent color
   */
  updateThemeAccentColor(color: AccentColor): void {
    const theme = this.settingsProvider.settingsValue?.theme;
    this._save({
      theme: { ...theme, accent: color },
    });
  }

  updateThemeMode(mode: ThemeMode): void {
    const theme = this.settingsProvider.settingsValue?.theme;
    this._save({
      theme: { ...theme, mode },
    });
  }

  addSettings(settings: Settings): Promise<Settings> {
    return this.io.addSettings(settings).then(sett => this.settingsProvider.pushSettings(sett));
  }

  getSettings(id?: UserID): Settings {
    const uid = id ?? this.authProvider.accountValue?.uid;
    return this.io.readSettings(uid);
  }
}
