import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { map, pluck } from 'rxjs/operators';
import { combineLatest, Subscription } from 'rxjs';
import { SettingsProvider } from 'src/app/providers/data/settings.provider';
import { FeeName, SupportedFiat, TxRefreshInterval } from 'src/app/interface/data';
import { SettingsService } from 'src/app/services/settings/settings.service';
import { Translate } from 'src/app/providers/translate/';
import { AuthenticationProvider } from 'src/app/providers/data/authentication.provider';
import { IdentityVerificationLevel } from 'src/app/interface/user';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { AccountService } from 'src/app/services/authentication/account.service';
import { MultiFactorAuthenticationService } from 'src/app/services/authentication/mfa.service';
import { WalletsProvider } from 'src/app/providers/data/wallets.provider';
import { BiometricService } from '../../../services/authentication/biometric.service';
import { ThemeService } from 'src/app/services/settings/theme.service';
import { Location } from '@angular/common';
import { ThemeMode } from 'src/app/interface/settings';
import { LivechatService } from '../../../services/livechat.service';
import { UserDataService } from '../../../services/authentication/user-data.service';
import { AgreementData } from '../../../interface/account';
import { TrackedPage } from '../../../classes/trackedPage';
import { RegistrationService } from '../../../services/authentication/registration.service';
import * as Util from 'util';
import { UtilsService } from '../../../services/utils.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage extends TrackedPage {
  refreshIntervalList: TxRefreshInterval[] = Object.values(TxRefreshInterval).filter(
    a => typeof a === 'number',
  ) as TxRefreshInterval[];
  fiatCurrencies: SupportedFiat[] = ['USD', 'EUR'];
  fees: FeeName[] = Object.values(FeeName) as FeeName[];
  settings$ = this.settingsProvider.settings$;
  email$ = this.authProvider.account$.pipe(pluck('email'));
  activeWalletsCounter$ = combineLatest([
    this.walletsProvider.allWallets$,
    this.walletsProvider.wallets$,
  ]).pipe(map(([a, w]) => `${w?.length ?? 0} / ${a?.length ?? 0}`));
  languages: { id: string; title: string }[] = [
    { id: 'ae', title: this.$.ARABIC },
    // { id: 'zh', title: this.$.CHINESE },
    { id: 'cz', title: this.$.CZECH },
    { id: 'de', title: this.$.GERMAN },
    { id: 'en', title: this.$.ENGLISH },
    { id: 'es', title: this.$.SPANISH },
    { id: 'fr', title: this.$.FRENCH },
    { id: 'hu', title: this.$.HUNGARIAN },
    { id: 'it', title: this.$.ITALIAN },
    { id: 'kr', title: this.$.KOREAN },
    { id: 'pl', title: this.$.POLISH },
    { id: 'ro', title: this.$.ROMANIAN },
    { id: 'ru', title: this.$.RUSSIAN },
  ];

  themeModeOpts: Array<{ title: string; value: ThemeMode }> = [
    { title: this.$.instant(this.$.DARK), value: ThemeMode.dark },
    { title: this.$.instant(this.$.LIGHT), value: ThemeMode.light },
  ];

  MODES = ThemeMode;

  advertising: boolean;
  userSettingsLoaded = false;

  notificationCount = 0;

  isBiometricsEnabled = false;

  private _originUrl = this.router.getCurrentNavigation().extras.state?.origin || '/home/wallets';
  private subscription = new Subscription();

  constructor(
    private router: Router,
    private location: Location,
    private theme: ThemeService,
    private acc: AccountService,
    private utils: UtilsService,
    private sett: SettingsService,
    private bio: BiometricService,
    private liveChat: LivechatService,
    private auth: AuthenticationService,
    private userDataService: UserDataService,
    private walletsProvider: WalletsProvider,
    private registration: RegistrationService,
    private settingsProvider: SettingsProvider,
    private authProvider: AuthenticationProvider,
    private mfa: MultiFactorAuthenticationService,
    public $: Translate,
  ) {
    super();

    this.subscription
      .add(
        this.settingsProvider.notificationCount$.subscribe(
          count => (this.notificationCount = count),
        ),
      )
      .add(
        this.authProvider.account$.subscribe(
          acc => (this.isBiometricsEnabled = acc?.lvl > IdentityVerificationLevel.BIOMETRICS_OFF),
        ),
      );
    this.getAdvertising();
  }

  async toggleBiometrics() {
    const opts = { reset: false, alog: true };
    const isBiometricsEnabled = this.isBiometricsEnabled;
    try {
      if (!isBiometricsEnabled) {
        const { idt } = this.authProvider.accountValue;
        await this.bio
          .storeBiometricCredentialsToKeychain(idt)
          .then(() =>
            this.acc.updateAccount({ lvl: IdentityVerificationLevel.BIOMETRICS_ON }, opts),
          );
      } else {
        await this.bio
          .deleteBiometricsFromKeychain()
          .then(() =>
            this.acc.updateAccount({ lvl: IdentityVerificationLevel.BIOMETRICS_OFF }, opts),
          );
      }
    } catch (err) {
      this.acc.updateAccount({ lvl: IdentityVerificationLevel.BIOMETRICS_OFF }, opts);
      console.error(err);
    }
  }

  private async _navigate(url: string[]) {
    await this.router.navigate(['home', 'user', 'settings', ...url], {
      state: { url: this.location.path() },
    });
  }

  private async _navigateSecurely(url: string[]) {
    const modal = await this.mfa.showIdentityVerificationModal({
      fullScreen: true,
      attempts: 3,
      warnAt: 2,
    });

    const {
      data: {
        result: [isVerified],
      },
    } = await modal.onDidDismiss();

    if (!isVerified) return;
    await this._navigate(url);
  }

  async navigate(url: string[], secured = false) {
    if (secured) await this._navigateSecurely(url);
    else await this._navigate(url);
  }

  async changeLanguage(language: string): Promise<void> {
    try {
      await this.$.changeLanguage(language);
      await this.sett.updateSettings({ language });
    } catch (err) {
      console.error(err);
    }
  }

  changeAltCurrency(currency: SupportedFiat) {
    this.sett.updateSettings({ currency });
  }

  updateRefreshInterval(refresh: string) {
    this.sett.updateSettings({ refresh: Number(refresh) });
  }

  updateFeePolicy(feePolicy: FeeName) {
    this.sett.updateSettings({ feePolicy });
  }

  async logout() {
    await this.auth.logout();
    this.walletsProvider.clean();
    await this.theme.applyTheme(this.settingsProvider.defaultTheme);
  }

  doRefresh(event: any) {
    event.detail.complete();
  }

  goBack() {
    this.router.navigateByUrl(this._originUrl);
  }

  toggleDarkMode(curr: boolean) {
    const th = curr ? ThemeMode.light : ThemeMode.dark;
    this.theme.updateThemeMode(th);
  }

  async toggleAdvertising() {
    this.userSettingsLoaded = false;

    this.userDataService
      .updateAdvertising(this.advertising)
      .then(() => this.getAdvertising())
      .catch(e => {
        console.error(e);
        this.utils.showToast('An error occurred, please try it later', 2000, 'warning');
      });
  }

  openChat() {
    this.liveChat.openChat();
  }

  private getAdvertising() {
    this.userSettingsLoaded = false;
    this.userDataService.getAdvertising().then(res => {
      this.userSettingsLoaded = true;
      this.advertising = res;
    });
  }
}
