import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';
import { filter, pluck, startWith } from 'rxjs/operators';

import { Settings, AccentColor, ThemeMode } from 'src/app/interface/settings';

@Injectable()
export class SettingsProvider {
  readonly defaultCurrency = 'usd';
  readonly defaultLocale = 'en';
  readonly defaultTheme = { accent: AccentColor.default, mode: ThemeMode.light };

  private settings = new BehaviorSubject<Settings>(null);
  settings$ = this.settings.asObservable();

  // we can refactor this in future to support more notifications
  private notificationCount = new BehaviorSubject<number>(0);
  notificationCount$ = this.notificationCount.asObservable();

  theme$ = this.settings.pipe(
    pluck('theme'),
    startWith(this.defaultTheme),
    filter(th => !!th),
  );

  language$ = this.settings.pipe(pluck('language'));
  primaryWallet$ = this.settings.pipe(pluck('primaryWallet'));

  // @todo dont change the color to hex as a standalone observable
  // instead calculate it in map function in theme$ observable
  private accentColorHEX = new BehaviorSubject<string>(null);
  accentColor$ = this.accentColorHEX.asObservable();

  private tapbarVisibility = new BehaviorSubject<boolean>(true);
  tapbarVisibility$ = this.tapbarVisibility.asObservable();

  canSendReport = true;

  private readonly TIMEOUT = 300000;

  pushAccentColorHEX(color: string) {
    this.accentColorHEX.next(color);
  }

  pushSettings(settings: Settings): Settings {
    this.settings.next(settings);
    // this.theme.next(settings.theme);
    return settings;
  }

  pushTapbarVisibility(visible: boolean) {
    this.tapbarVisibility.next(visible);
  }

  sendReportTimeout() {
    this.canSendReport = false;
    setTimeout(() => (this.canSendReport = true), this.TIMEOUT);
  }

  increaseNotificationCount(newMessages = 1) {
    this.notificationCount.next(this.notificationCount.value + newMessages);
  }

  setNotificationCount(number: number) {
    this.notificationCount.next(number);
  }

  get currency(): string {
    const settings = this.settings.value;
    return settings.currency || this.defaultCurrency;
  }

  get locale(): string {
    const settings = this.settings.value;
    return settings.language || this.defaultLocale;
  }

  get settingsValue(): Settings {
    return this.settings.value;
  }
}
