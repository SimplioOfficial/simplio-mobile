import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { SettingsService } from './settings.service';
import { SettingsProvider } from 'src/app/providers/data/settings.provider';
import { ThemeMode, AccentColor, ThemeSettings } from 'src/app/interface/settings';
import { StatusBar, Style } from '@capacitor/status-bar';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  readonly $body: HTMLElement = this.window.document.body;

  constructor(
    private settingsService: SettingsService,
    private settingsProvider: SettingsProvider,
    private window: Window,
  ) {}

  /**
   *  Updating a Theme mode
   *  @param mode
   */
  updateThemeMode(mode: ThemeMode): ThemeMode {
    this.settingsService.updateThemeMode(mode);
    return mode;
  }

  /**
   *  Updating a Accent color
   *  @param color
   */
  updateAccentColor(color: AccentColor): AccentColor {
    this.settingsService.updateThemeAccentColor(color);
    return color;
  }

  /**
   *  Applying a provided theme
   */
  applyTheme(theme: ThemeSettings): ThemeSettings {
    try {
      this._applyMode(theme.mode, this.$body);
      this._applyAccentColor(theme.accent, this.$body);
      this._applyStatusStyle(theme.mode);
    } catch (e) {
      console.log('Setting theme has failed');
    }

    return theme;
  }

  /**
   *
   * @param mode
   */
  getStatusbarForeground(mode: ThemeMode): Style {
    return mode === ThemeMode.dark ? Style.Dark : Style.Light;
  }

  /**
   *
   */
  getStatusbarBackground(mode: ThemeMode): string {
    return mode === ThemeMode.dark ? '#0f0e0e' : '#ffffff';
  }

  /**
   *
   * @param mode
   * @param $body
   */
  private _applyMode(mode: ThemeMode, $body: HTMLElement) {
    $body.classList.toggle('dark', mode === ThemeMode.dark);
    $body.classList.toggle('light', mode === ThemeMode.light);
  }

  /**
   *
   * @param accent
   * @param $body
   */
  private _applyAccentColor(accent: AccentColor, $body: HTMLElement) {
    const accentAttr = 'data-accent';
    if (!accent) {
      $body.removeAttribute(accentAttr);
    } else {
      $body.setAttribute(accentAttr, accent.toString());
      const color = getComputedStyle($body).getPropertyValue('--ion-color-primary');
      this.settingsProvider.pushAccentColorHEX(color);
    }
  }

  private _applyStatusStyle(mode: ThemeMode) {
    if (!Capacitor.isPluginAvailable('StatusBar')) return this;

    StatusBar.setStyle({
      style: this.getStatusbarForeground(mode),
    });

    StatusBar.setBackgroundColor({
      color: this.getStatusbarBackground(mode),
    });

    return this;
  }
}
