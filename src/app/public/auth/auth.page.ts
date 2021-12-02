import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject, fromEvent, Subscription } from 'rxjs';
import { App } from '@capacitor/app';
import { SioPinValueComponent } from 'src/app/components/form/sio-pin-value/sio-pin-value.component';
import { Settings } from 'src/app/interface/settings';
import { Acc, IdentityVerificationLevel } from 'src/app/interface/user';
import { AuthenticationProvider } from 'src/app/providers/data/authentication.provider';
import { Translate } from 'src/app/providers/translate/';
import { AccountService } from 'src/app/services/authentication/account.service';
import { environment } from 'src/environments/environment';
import { BiometricService } from '../../services/authentication/biometric.service';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { PlatformProvider } from 'src/app/providers/platform/platform';
import { IoService } from 'src/app/services/io.service';

export const PIN_CODE = 'pinCode';

@Component({
  selector: 'auth-page',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
  results: boolean[] = [];
  backButtonSubscription: Subscription;

  @ViewChild('pinEl', { static: false }) valueComponent: SioPinValueComponent;

  account = this.router.getCurrentNavigation().extras.state as Acc;
  settings: Settings = null;
  warnAt = 1;
  isBiometricEnabled = false;

  readonly AUTH_METHOD = IdentityVerificationLevel;
  readonly PIN_LENGTH = environment.PIN_LENGTH;
  formField: FormGroup = this.fb.group({
    [PIN_CODE]: ['', [Validators.required, Validators.minLength(this.PIN_LENGTH)]],
  });
  readonly PIN_CODE_KEY = PIN_CODE;

  private _selectedMethod = IdentityVerificationLevel.PIN;
  private _remainingAttempts = 3;

  private _loading = new BehaviorSubject(false);
  loading$ = this._loading.asObservable();

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private acc: AccountService,
    private auth: AuthenticationService,
    private biometricService: BiometricService,
    private authProvider: AuthenticationProvider,
    private platform: PlatformProvider,
    private io: IoService,
    public $: Translate,
  ) {}

  get securityLevel(): IdentityVerificationLevel {
    return this._selectedMethod;
  }

  get remainingsAttempts(): number {
    return this._remainingAttempts;
  }

  get result(): boolean {
    return this.results.length === 0 ? true : this.results[this.results.length];
  }

  ngOnInit() {
    if (!this.account) {
      this.platform
        .ready()
        .then(() => this.io.initDb())
        .then(() => this.io.loadData())
        .then(data => {
          this.account = data.account;
          this._resolveMethod(this.account);
        });
    } else {
      this._resolveMethod(this.account);
    }
  }

  ionViewWillEnter() {
    const event$ = fromEvent(document, 'ionBackButton', { once: true });
    this.backButtonSubscription = event$.subscribe(() => {
      App.exitApp();
    });
  }

  ionViewWillLeave() {
    this.backButtonSubscription.unsubscribe();
  }

  decreaseAttempt() {
    if (this._remainingAttempts > 0) {
      this._remainingAttempts = this._remainingAttempts - 1;
    }
  }

  onAmountChange(value: number) {
    this.valueComponent.updateInputValue(value);
  }

  async onPin(pin) {
    try {
      const unlockedAccount = this.acc.unlockAccount(this.account, pin);
      this.authProvider.pushAccount(unlockedAccount);
    } catch (err) {
      if (this._remainingAttempts > 1) {
        this.results.push(false);
        this.decreaseAttempt();
        this.resetPinCode();
      } else {
        this.auth.logout();
        App.exitApp();
      }
      this.valueComponent.dismiss();
    }
  }

  private async _resolveMethod(account: Acc) {
    switch (account?.lvl) {
      case IdentityVerificationLevel.BIOMETRICS_ON:
        return await this.showBiometrics();
      case IdentityVerificationLevel.PIN:
      case IdentityVerificationLevel.BIOMETRICS_OFF:
        return await this.showPin();
      default:
        return;
    }
  }

  async showBiometrics() {
    try {
      this.setMethod(IdentityVerificationLevel.BIOMETRICS_ON);
      const cred = await this.biometricService.getBiometricsCredentials();
      this._loading.next(true);
      if (!cred) throw new Error();

      await this.onPin(cred);
    } catch (err) {
      this.setMethod(IdentityVerificationLevel.PIN);
    }
  }

  showPin() {
    this.setMethod(IdentityVerificationLevel.PIN);
  }

  private setMethod(meth: IdentityVerificationLevel) {
    this._selectedMethod = meth;
  }

  private resetPinCode() {
    this.valueComponent.resetInputValue();
  }
}
