import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Acc } from 'src/app/interface/user';
import { AccountRegistrationError } from 'src/app/providers/errors/account-registration-error';
import { Translate } from 'src/app/providers/translate';
import { AuthenticationProvider } from 'src/app/providers/data/authentication.provider';
import { IoService } from 'src/app/services/io.service';
import { PlatformProvider } from 'src/app/providers/platform/platform';
import { USERS_URLS } from '../../providers/routes/account.routes';
import { HttpFallbackService } from '../apiv2/connection/http-fallback.service';

type AccountUpdateOptions = {
  secret: string;
  reset: boolean;
  alog: boolean;
};

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private resetPasswordTimeout = null;

  constructor(
    private $: Translate,
    private io: IoService,
    private plt: PlatformProvider,
    private authProvider: AuthenticationProvider,
    private http: HttpFallbackService
  ) {}

  get canResetPassword(): boolean {
    return !this.resetPasswordTimeout;
  }

  async resetPassword(email: string): Promise<void> {
    const url = USERS_URLS.reset.href;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    const body = { emailAddress: email };
    return this.http.post<void>(url, body, { headers }).catch((err: HttpErrorResponse) => {
      throw new AccountRegistrationError(err, this.$);
    });
  }

  changePassword(password: string): Promise<void> {
    const url = USERS_URLS.password.href;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    const body = { password };

    return this.http.put<void>(url, body, { headers }).catch((err: HttpErrorResponse) => {
      throw new AccountRegistrationError(err, this.$);
    });
  }

  addAccount(account: Acc): Promise<Acc> {
    return this.io.addAccount(account).catch(() => this.authProvider.pushAccount(null));
  }

  updateAccount(data: Partial<Acc>, opt: Partial<AccountUpdateOptions> = {}): Promise<Acc> {
    const acc = this.authProvider.accountValue;
    const opts: AccountUpdateOptions = {
      alog: false,
      reset: false,
      secret: acc.idt,
      ...opt,
    };

    return this.io
      .updateAccount({ ...acc, ...data }, opts.secret, opt.alog)
      .then(acc => this.authProvider.pushAccount(acc, { changeAuthStatus: opt.reset }));
  }

  unlockAccount(account: Acc, secret: string): Acc {
    return this.io.unlockAccount(account, secret);
  }
}
