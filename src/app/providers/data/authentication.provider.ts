import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Acc, IdentityVerificationLevel } from 'src/app/interface/user';
import { VerificationRecord } from '../../interface/kyc';

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
  sumSubStatus: '',
  verificationRecord: null,
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

  private _sumsubStatus = new BehaviorSubject<string>(defaults.sumSubStatus);
  sumSubStatus$ = this._sumsubStatus.asObservable();

  private _latestVerificationRecord = new BehaviorSubject<VerificationRecord>(
    defaults.verificationRecord,
  );
  latestVerificationRecord$ = this._latestVerificationRecord.asObservable();

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

  get isVerifiedValue(): [boolean, string] {
    return [this._sumsubStatus.value === 'GREEN', this._sumsubStatus.value];
  }

  get latestVerificationRecord(): VerificationRecord {
    return this._latestVerificationRecord.value;
  }

  pushSumsubStatus(status: string): string {
    this._sumsubStatus.next(status);

    return status;
  }

  pushVerificationRecord(record: VerificationRecord): VerificationRecord {
    this._latestVerificationRecord.next(record);
    return record;
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
