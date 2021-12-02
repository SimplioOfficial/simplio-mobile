import { AfterContentInit, AfterViewInit, Component } from '@angular/core';
import { Translate } from 'src/app/providers/translate/';
import { AuthenticationProvider } from 'src/app/providers/data/authentication.provider';
import { BiometricService } from '../../../services/authentication/biometric.service';
import { AccountService } from 'src/app/services/authentication/account.service';
import { IdentityVerificationLevel } from 'src/app/interface/user';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'activate-biometrics-repeat',
  templateUrl: './repeat-biometrics.page.html',
  styleUrls: ['./repeat-biometrics.page.scss'],
})
export class RepeatBiometricsPage implements AfterContentInit {
  private _isLoading = new BehaviorSubject(false);
  loading$ = this._isLoading.asObservable();

  constructor(
    private router: Router,
    private bio: BiometricService,
    private acc: AccountService,
    private authProvider: AuthenticationProvider,
    public $: Translate,
  ) {}

  ngAfterContentInit(): void {
    this.onSubmit();
  }

  async onSubmit() {
    try {
      const { idt } = this.authProvider.accountValue;
      await this.bio.storeBiometricCredentialsToKeychain(idt);
      this._isLoading.next(true);
      // await this.acc.updateAccount({ lvl: IdentityVerificationLevel.BIOMETRICS_ON }, { alog: true });
      this.authProvider.pushAccount({
        ...this.authProvider.accountValue,
        lvl: IdentityVerificationLevel.BIOMETRICS_ON,
      });
    } catch (err) {
      console.error(err);
      this._isLoading.next(false);
    }
  }

  back() {
    this.router.navigate(['biometrics', 'enter']);
  }
}
