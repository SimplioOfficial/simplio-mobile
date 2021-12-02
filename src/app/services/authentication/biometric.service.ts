import { Injectable } from '@angular/core';
import { FingerprintAIO, FingerprintSecretOptions } from '@ionic-native/fingerprint-aio/ngx';
import { PlatformProvider } from '../../providers/platform/platform';
import { Translate } from 'src/app/providers/translate';

@Injectable({
  providedIn: 'root',
})
export class BiometricService {
  readonly biometricsKey = 'simplio-biometrics';

  constructor(
    private fingerprint: FingerprintAIO,
    private platformProvider: PlatformProvider,
    private $: Translate,
  ) {}

  getBiometricsCredentials(): Promise<string> {
    const config = {
      title: '',
      description: this.$.instant(this.$.LOGIN),
      disableBackup: true,
    };
    return this.fingerprint
      .isAvailable()
      .then<string>(() => this.fingerprint.loadBiometricSecret(config));
  }

  deleteBiometricsFromKeychain(): Promise<void> {
    const config: FingerprintSecretOptions = {
      description: 'Do you really want to remove your credentials from the keychain?',
      secret: '',
    };
    return this.fingerprint
      .isAvailable()
      .then(() => this.fingerprint.registerBiometricSecret(config))
      .then(() => console.log('Biometrics: Keychain passwords have been removed'))
      .catch(() => {});
  }

  storeBiometricCredentialsToKeychain(
    credentials: string,
    opts: Partial<FingerprintSecretOptions> = {},
  ): Promise<string> {
    const biometricsConfig: FingerprintSecretOptions = {
      description: 'Do you want to use biometrics for login?',
      invalidateOnEnrollment: true,
      disableBackup: true,
      ...opts,
      secret: credentials,
    };
    return this.fingerprint
      .isAvailable()
      .then(() => this._resolveStoringCredentialsToKeychain(biometricsConfig))
      .then(() => credentials);
  }

  private async _resolveStoringCredentialsToKeychain(options: FingerprintSecretOptions) {
    if (this.platformProvider.isIOS) await this._resolveStoringCredentialsIOS(options);
    if (this.platformProvider.isAndroid) await this._resolveStoringCredentialsAndroid(options);
  }

  /*
   * ios does not display dialog when secret is stored in the keychain
   */
  private async _resolveStoringCredentialsIOS(options: FingerprintSecretOptions): Promise<void> {
    await this.fingerprint.show({ description: options.description });
    await this.fingerprint.registerBiometricSecret(options);
  }

  private async _resolveStoringCredentialsAndroid(
    options: FingerprintSecretOptions,
  ): Promise<void> {
    await this.fingerprint.registerBiometricSecret(options);
  }
}
