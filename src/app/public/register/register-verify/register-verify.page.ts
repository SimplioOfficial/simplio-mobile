import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { delay, map, retryWhen, tap } from 'rxjs/operators';

import { AccountCredentials, AgreementData } from 'src/app/interface/account';
import { AuthenticationProvider } from 'src/app/providers/data/authentication.provider';
import { Translate } from 'src/app/providers/translate/';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { UserDataService } from '../../../services/authentication/user-data.service';
import { PlatformProvider } from '../../../providers/platform/platform';

@Component({
  selector: 'register-verify-page',
  templateUrl: './register-verify.page.html',
  styleUrls: ['./register-verify.page.scss'],
})
export class RegisterVerifyPage implements OnInit, OnDestroy {
  autologin: Subscription;
  res = this.router.getCurrentNavigation()?.extras?.state?.response as AccountCredentials;
  agreements = this.router.getCurrentNavigation()?.extras?.state?.agreements as AgreementData;

  tapServiceAccountVerification(tapFn = () => {}): Observable<boolean> {
    return this.authProvider.isAuthenticated$.pipe(
      map(v => {
        if (v === false) throw v;
        else return v;
      }),
      retryWhen(v => v.pipe(tap(tapFn), delay(3000))),
    );
  }

  constructor(
    private router: Router,
    private plt: PlatformProvider,
    private auth: AuthenticationService,
    private userDataService: UserDataService,
    private authProvider: AuthenticationProvider,
    public $: Translate,
  ) {}

  ngOnInit() {
    const tapFn = async () =>
      this.auth
        .login(this.res, { verify: false, isNew: true })
        .then(() => this.userDataService.initializeAdvertising(this.agreements.advertising))
        .then(() =>
          this.userDataService.create('agreements', 'json', JSON.stringify(this.agreements)),
        );

    this.autologin = this.tapServiceAccountVerification(tapFn).subscribe();
  }

  ngOnDestroy() {
    this.autologin.unsubscribe();
  }
}
