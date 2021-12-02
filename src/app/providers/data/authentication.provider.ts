import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IdentityVerificationLevel, Acc } from 'src/app/interface/user';

type AccountChangeOptions = { changeAuthStatus: boolean; isNew: boolean };

const defaults = {
  account: null,
  storeAccount: false,
  isAuthenticated: false,
  canRecover: true,
  autheticationErrors: null,
  accessTokenBody: null,
  kycRegistrationError: null,
  userInfo: null,
  biometricsEnabled: false,
  biometricsCredentials: {
    pin: '',
  },
};

@Injectable()
export class AuthenticationProvider {
  private _storeAccount = new BehaviorSubject<boolean>(defaults.storeAccount);
  storeAccount$ = this._storeAccount.asObservable();

  private _account = new BehaviorSubject<Acc>(defaults.account);
  account$ = this._account.asObservable();

  private _isAuthenticated = new BehaviorSubject<boolean>(defaults.isAuthenticated);
  isAuthenticated$ = this._isAuthenticated.asObservable();

  private _canRecover = new BehaviorSubject<boolean>(defaults.canRecover);
  canRecover$ = this._canRecover.asObservable();

  get isSecuredValue(): boolean {
    const account = this._account.value;
    return account.lvl >= IdentityVerificationLevel.PIN;
  }

  get isBiometricsValue(): boolean {
    const account = this._account.value;
    return account.lvl >= IdentityVerificationLevel.BIOMETRICS_OFF;
  }

  get securityLevelValue(): IdentityVerificationLevel {
    return this._account.value?.lvl ?? IdentityVerificationLevel.NONE;
  }

  get isAuthenticatedValue(): boolean {
    return !!this._account.value;
  }

  get accountValue(): Acc {
    return this._account.value;
  }

  pushAccount(account: Acc, options: Partial<AccountChangeOptions> = {}): Acc {
    const opts: AccountChangeOptions = {
      changeAuthStatus: true,
      isNew: false,
      ...options,
    };

    this._account.next(account);

    if (opts.changeAuthStatus) this._isAuthenticated.next(!!account);
    if (opts.isNew) this._storeAccount.next(true);

    return account;
  }

  pushCanRecover(val: boolean): boolean {
    this._canRecover.next(val);
    return val;
  }

  clean() {
    this.pushAccount(defaults.account);
    this._canRecover.next(defaults.canRecover);
  }
}
