import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Settings } from '../interface/settings';
import { AuthenticationProvider } from '../providers/data/authentication.provider';
import { SettingsProvider } from '../providers/data/settings.provider';
import { SettingsService } from '../services/settings/settings.service';

@Injectable()
export class AccountSettingsResolver implements Resolve<Settings> {
  constructor(
    private authProvider: AuthenticationProvider,
    private sett: SettingsService,
    private settings: SettingsProvider,
  ) {}

  async resolve(): Promise<Settings> {
    const acc = this.authProvider.accountValue;
    let settings = this.sett.getSettings(acc.uid);

    if (!settings) {
      const s = this.sett.createDefaultSettings(acc.uid);
      settings = await this.sett.addSettings(s);
    }

    this.settings.pushSettings(settings);
    return settings;
  }
}
