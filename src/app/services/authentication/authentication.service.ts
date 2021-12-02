import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  AccountCredentials,
  AccountCredentialsResponse,
  RegisterAccountData,
} from 'src/app/interface/account';
import { Acc, AccLog, IdentityVerificationLevel } from 'src/app/interface/user';
import { IdentityVerificationError } from 'src/app/providers/errors/identity-verification-error';
import { Translate } from 'src/app/providers/translate';
import { AuthenticationProvider } from '../../providers/data/authentication.provider';
import { PlatformProvider } from '../../providers/platform/platform';
import { IoService } from '../io.service';
import { httpHeaders, parseJWT } from './utils';
import { MultiFactorAuthenticationService } from './mfa.service';
import { USERS_URLS, USERS_URLS_V2 } from 'src/app/providers/routes/swap.routes';
import { AccountService } from 'src/app/services/authentication/account.service';
import { SwapProvider } from '../../providers/data/swap.provider';
import { HttpService } from '../http.service';

type AfterLoginOptions = { verify: boolean; isNew: boolean };

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private reloadTimeout = null;
  private _refreshServerUrl = '';
  constructor(
    private $: Translate,
    private mfa: MultiFactorAuthenticationService,
    private plt: PlatformProvider,
    private io: IoService,
    private authProvider: AuthenticationProvider,
    private swapProvider: SwapProvider,
    private http: HttpClient,
    private acc: AccountService,
  ) {}

  serverUrl() {
    return this._refreshServerUrl;
  }

  checkPassword(password: string): Promise<boolean> {
    const url = USERS_URLS.access.href;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    const cred = {
      userId: this.authProvider.accountValue.email,
      email: this.authProvider.accountValue.email,
      password,
    };

    return this.http
      .post<AccountCredentialsResponse>(url, cred, { headers })
      .toPromise()
      .then(res => !!res.refresh_token);
  }

  isValid(token: string): boolean {
    if (!Boolean(token.length)) return false;

    try {
      const { exp } = parseJWT(token);
      return new Date(exp * 1000) > new Date();
    } catch (error) {
      return false;
    }
  }

  async login(cred: AccountCredentials, opt: Partial<AfterLoginOptions> = {}): Promise<Acc> {
    try {
      const cr = await this._login(cred);
      console.log(cr);
      const accountLog = await this.io.getLatestAccountLog(cred.userId);

      const o: AfterLoginOptions = {
        verify: true,
        isNew: false,
        ...opt,
      };

      const accountStruct: Acc = {
        uid: cred.userId,
        rtk: cr.refresh_token,
        atk: cr.access_token,
        tkt: cr.token_type,
        idt: '',
        lvl: accountLog?.lvl ?? IdentityVerificationLevel.NONE,
        email: cred.email,
      };

      const account = o.verify
        ? await this._verifyAccount(accountStruct, accountLog)
        : accountStruct;
      return this.authProvider.pushAccount(account, { isNew: o.isNew });
    } catch (err) {
      // TODO - resolve error here
      throw err;
    }
  }

  logout() {
    return this.io.removeAccount().then(() => {
      this.authProvider.clean();
      this.swapProvider.clean();
    });
  }

  refresh(acc: Acc): Promise<Acc> {
    return this._refresh(acc.rtk)
      .then(c =>
        this.acc.updateAccount({ rtk: c.refresh_token, atk: c.access_token, tkt: c.token_type }),
      )
      .catch(err => {
        this.logout();
        throw err;
      });
  }

  getAccountData(): Promise<RegisterAccountData> {
    const url = USERS_URLS.account.href;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.http.get<RegisterAccountData>(url, { headers }).toPromise();
  }

  async checkToken() {
    if (!this.isValid(this.authProvider.accountValue.atk)) {
      return this.refresh(this.authProvider.accountValue);
    }
  }

  private _login(cred: AccountCredentials): Promise<AccountCredentialsResponse> {
    return this._loginv1(cred).catch(err => {
      return this._loginv2(cred).catch(_ => {
        throw err;
      });
    });
  }
  private _loginv1(cred: AccountCredentials): Promise<AccountCredentialsResponse> {
    const url = USERS_URLS.access.href;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http
      .post<AccountCredentialsResponse>(url, cred, { headers })
      .toPromise()
      .catch((err: HttpErrorResponse) => {
        if (err.status === 401) {
          let customErr = new HttpErrorResponse({
            headers: err.headers,
            url: err.url,
            status: err.status,
            statusText: err.statusText,
            error: Object.freeze({
              code: 'NO_SUCH_USER',
            }),
          });
          if (err.error.includes('verify your email')) {
            customErr = new HttpErrorResponse({
              headers: err.headers,
              url: err.url,
              status: err.status,
              statusText: err.statusText,
              error: Object.freeze({
                code: 'INCOMPLETE_REGISTRATION_PROCESS',
              }),
            });
          }

          throw new IdentityVerificationError(customErr, this.$);
        }
        throw err;
      });
  }

  private _loginv2(cred: AccountCredentials): Promise<AccountCredentialsResponse> {
    const url = USERS_URLS_V2.access.href;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http
      .post<AccountCredentialsResponse>(url, cred, { headers })
      .toPromise()
      .catch((err: HttpErrorResponse) => {
        if (err.status === 401) {
          let customErr = new HttpErrorResponse({
            headers: err.headers,
            url: err.url,
            status: err.status,
            statusText: err.statusText,
            error: Object.freeze({
              code: 'NO_SUCH_USER',
            }),
          });
          if (err.error.includes('verify your email')) {
            customErr = new HttpErrorResponse({
              headers: err.headers,
              url: err.url,
              status: err.status,
              statusText: err.statusText,
              error: Object.freeze({
                code: 'INCOMPLETE_REGISTRATION_PROCESS',
              }),
            });
          }

          throw new IdentityVerificationError(customErr, this.$);
        }
        throw err;
      });
  }

  private _refresh(refreshToken: string): Promise<AccountCredentialsResponse> {
    console.log('Refresh token');
    return this._refreshv1(refreshToken).catch(err => {
      return this._refreshv2(refreshToken).catch(_ => {
        throw err;
      });
    });
  }
  private _refreshv1(refreshToken: string): Promise<AccountCredentialsResponse> {
    const url = USERS_URLS.refresh.href;
    this._refreshServerUrl = url;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    const body = { refreshToken };

    return this.http
      .post<AccountCredentialsResponse>(url, body, { headers })
      .toPromise()
      .catch((err: HttpErrorResponse) => {
        if (err.status === 401) {
          const customErr = new HttpErrorResponse({
            headers: err.headers,
            url: err.url,
            status: err.status,
            statusText: err.statusText,
            error: Object.freeze({
              code: 'NO_SUCH_USER',
            }),
          });
          throw new IdentityVerificationError(customErr, this.$);
        }
        throw err;
      });
  }

  private _refreshv2(refreshToken: string): Promise<AccountCredentialsResponse> {
    const url = USERS_URLS_V2.refresh.href;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    const body = { refreshToken };

    return this.http
      .post<AccountCredentialsResponse>(url, body, { headers })
      .toPromise()
      .then(res => {
        this._refreshServerUrl = url;
        return res;
      })
      .catch((err: HttpErrorResponse) => {
        if (err.status === 401) {
          const customErr = new HttpErrorResponse({
            headers: err.headers,
            url: err.url,
            status: err.status,
            statusText: err.statusText,
            error: Object.freeze({
              code: 'NO_SUCH_USER',
            }),
          });
          throw new IdentityVerificationError(customErr, this.$);
        }
        throw err;
      });
  }

  private async _verifyAccount(acc: Acc, accLog: AccLog): Promise<Acc> {
    if (!accLog) return acc;
    const modal = await this.mfa.showIdentityVerificationModal({
      attempts: 3,
      warnAt: 1,
      closable: true,
      verificationLevel: acc.lvl,
      compareFn: pin => this.mfa.comparePin(accLog.idt, pin),
    });

    await modal.present();
    const {
      data: {
        result: [isVerified, io],
      },
    } = await modal.onDidDismiss();

    if (!isVerified) {
      throw new IdentityVerificationError(new HttpErrorResponse({}), this.$);
    }

    return { ...acc, idt: io };
  }
}
