import { Injectable } from '@angular/core';
import { IonicSafeString } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import en from '../../../assets/languages/en';
import about from 'src/assets/languages/about/en';
import { AlertOptions, AlertButton, AlertInput } from '@ionic/core';
import { GenericClass, sanitizeExtendedInput, transformObjectToPath } from './util';

export interface ExtendedMessage {
  message?: string | string[];
}

export type ExtendedAlertOptions = Omit<AlertOptions, 'message'> & ExtendedMessage;

@Injectable({
  providedIn: 'root',
})
export class Translate extends GenericClass<typeof en>() {
  constructor(private translateService: TranslateService) {
    super();
    Object.assign(this, transformObjectToPath('', en));
  }

  instant(v: string | string[], interpolateParams?: any): string {
    return this.translateService.instant(v, interpolateParams);
  }

  getCurrentLang(): string {
    return this.translateService.currentLang;
  }

  getDefaultLang(): string {
    return this.translateService.getDefaultLang();
  }

  fromEntries(arr) {
    return arr.reduce((acc, [k, v]) => ((acc[k] = v), acc), {});
  }

  async translate(message: IonicSafeString | IonicSafeString[]): Promise<string> {
    if (message instanceof IonicSafeString) {
      if (!message.value) return;
      return await this.translateService.get(message.value).toPromise();
    } else {
      return Promise.all(message.map(part => this.translate(part))).then(messageArray =>
        messageArray.join(' '),
      );
    }
  }

  async translateButton<T>(
    button: string | T,
    translateFn: (button) => Promise<T>,
  ): Promise<string | T> {
    if (typeof button === 'string') {
      return await this.translate(new IonicSafeString(button));
    }
    return await translateFn(button);
  }

  async translateAlertButton(button: AlertButton): Promise<AlertButton> {
    return {
      ...button,
      text: await this.translate(new IonicSafeString(button.text)),
    };
  }

  async translateAlertInput(input: AlertInput): Promise<AlertInput> {
    const trFn = this.translate.bind(this);
    const translatableFields = ['placeholder', 'label'];
    const translatedFields = Object.entries(input)
      .filter(([k]) => translatableFields.includes(k))
      .map(async ([k, v]) => [k, await trFn(new IonicSafeString(v))]);

    return { ...input, ...this.fromEntries(await Promise.all(translatedFields)) };
  }

  async translateAlert({
    header,
    message,
    buttons = [],
    inputs = [],
  }: ExtendedAlertOptions): Promise<AlertOptions> {
    return {
      header: await this.translate(new IonicSafeString(header)),
      message: await this.translate(sanitizeExtendedInput(message)).catch(_ => ''),
      inputs: await Promise.all(inputs.map(i => this.translateAlertInput(i))),
      buttons: await Promise.all(
        buttons.map(button =>
          this.translateButton<AlertButton>(button, button => this.translateAlertButton(button)),
        ),
      ),
    };
  }

  async changeLanguage(language: string): Promise<any> {
    await this.translateService.use(language).toPromise();
  }

  async downloadLanguage(language: string): Promise<any> {}
}

@Injectable()
export class TranslateAboutPage extends GenericClass<typeof about>() {
  constructor() {
    super();
    Object.assign(this, about);
  }
}
