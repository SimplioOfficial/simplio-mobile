import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ThemeService } from 'src/app/services/settings/theme.service';
import { SettingsProvider } from 'src/app/providers/data/settings.provider';
import { Translate } from 'src/app/providers/translate/';
import { ThemeMode, AccentColor, ThemeSettings } from 'src/app/interface/settings';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-theme',
  templateUrl: './theme.page.html',
  styleUrls: ['./theme.page.scss'],
})
export class ThemePage implements OnInit, OnDestroy {
  private subscription = new Subscription();

  themeMode: string;
  themeModeOpts: Array<{ title: string; value: ThemeMode }> = [
    { title: this.ts.instant(this.$.DARK), value: ThemeMode.dark },
    { title: this.ts.instant(this.$.LIGHT), value: ThemeMode.light },
  ];

  accentColor: string;
  accentColorsOpts: Array<{ title: string; value: AccentColor }> = [
    { title: this.ts.instant(this.$.DEFAULT), value: AccentColor.default },
    { title: this.ts.instant(this.$.BLUE), value: AccentColor.blue },
    { title: this.ts.instant(this.$.RED), value: AccentColor.red },
    { title: this.ts.instant(this.$.ORANGE), value: AccentColor.orange },
    { title: this.ts.instant(this.$.MONO), value: AccentColor.mono },
  ];

  constructor(
    private location: Location,
    private router: Router,
    private themeService: ThemeService,
    private settingsProvider: SettingsProvider,
    public $: Translate,
    private ts: TranslateService,
  ) {}

  ngOnInit() {
    const themeSubscribtion = this.settingsProvider.theme$.subscribe(
      this._onThemeSubscribtion.bind(this),
    );
    this.subscription.add(themeSubscribtion);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  setThemeMode(e) {
    const modeTitle = e.detail.value;
    const modeValue = this.themeModeOpts.find(m => m.title === modeTitle)?.value;
    this.themeService.updateThemeMode(modeValue || ThemeMode.light);
  }

  setAccentColor(e) {
    const colorTitle = e.detail.value;
    const colorValue = this.accentColorsOpts.find(m => m.title === colorTitle)?.value;
    this.themeService.updateAccentColor(colorValue || AccentColor.default);
  }

  private _onThemeSubscribtion(theme: ThemeSettings) {
    if (!theme) {
      return;
    }

    const modeValue = theme.mode || ThemeMode.light;
    this.themeMode = this.themeModeOpts.find(m => m.value === modeValue)?.title;

    const colorValue = theme.accent || AccentColor.default;
    this.accentColor = this.accentColorsOpts.find(c => c.value === colorValue)?.title;
  }
}
