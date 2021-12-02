import { Injectable } from '@angular/core';
import { BehaviorSubject } from '@polkadot/x-rxjs';

const defaults = {
  token: null,
  merchantKey: 'simplio-api-key',
  sumsubToken: null
};

@Injectable({
  providedIn: 'root'
})
export class SwipeluxProvider {
  private _authToken = new BehaviorSubject<string>(defaults.token);
  token$ = this._authToken.asObservable();

  private _merchantKey = new BehaviorSubject<string>(defaults.merchantKey);
  merchantKey$ = this._merchantKey.asObservable();

  private _sumsubToken = new BehaviorSubject<string>(defaults.sumsubToken);
  sumsubToken$ = this._sumsubToken.asObservable();

  constructor() {}

  get authToken(): string {
    return this._authToken.value;
  }

  setAuthToken(token: string): string {
    this._authToken.next(token);
    return token;
  }

  get merchantKey(): string {
    return this._merchantKey.value;
  }

  get sumsubToken(): string {
    return this._sumsubToken.value;
  }

  setSumsubToken(token: string) {
    this._sumsubToken.next(token);
    return token;
  }
}
