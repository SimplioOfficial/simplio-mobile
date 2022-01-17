import { Injectable } from '@angular/core';
import { BehaviorSubject } from '@polkadot/x-rxjs';

const defaults = {
  token: null,
  merchantKey: 'simplio-api-key',
  shareToken: null,
};

@Injectable({
  providedIn: 'root',
})
export class SwipeluxProvider {
  private _authToken = new BehaviorSubject<string>(defaults.token);
  token$ = this._authToken.asObservable();

  private _merchantKey = new BehaviorSubject<string>(defaults.merchantKey);
  merchantKey$ = this._merchantKey.asObservable();

  private _shareToken = new BehaviorSubject<string>(defaults.shareToken);
  shareToken$ = this._shareToken.asObservable();

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

  get shareToken(): string {
    return this._shareToken.value;
  }

  setShareToken(token: string) {
    this._shareToken.next(token);
    return token;
  }
}
