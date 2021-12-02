import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IdentityVerificationLevel } from 'src/app/interface/user';
import { AccountService } from 'src/app/services/authentication/account.service';
import { Translate } from 'src/app/providers/translate/';
import { BehaviorSubject } from 'rxjs';
import { AuthenticationProvider } from 'src/app/providers/data/authentication.provider';

@Component({
  selector: 'activate-biometrics-enter',
  templateUrl: './enter-biometrics.page.html',
  styleUrls: ['./enter-biometrics.page.scss'],
})
export class EnterBiometricsPage {
  private _loading = new BehaviorSubject(false);
  loading$ = this._loading.asObservable();

  constructor(
    private router: Router,
    private acc: AccountService,
    public $: Translate,
    private authProvider: AuthenticationProvider,
  ) {}

  private async _activate() {
    await this.router.navigate(['biometrics', 'repeat']);
  }

  private async _ignore() {
    try {
      this._loading.next(true);
      const lvl = IdentityVerificationLevel.BIOMETRICS_OFF;
      // await this.acc.updateAccount({ lvl }, { alog: true, reset: true });
      this.authProvider.pushAccount(
        { ...this.authProvider.accountValue, lvl },
        { changeAuthStatus: true },
      );
    } catch (err) {
      console.error(err);
    }
  }

  async onSubmit(state: boolean) {
    return state ? await this._activate() : await this._ignore();
  }
}
