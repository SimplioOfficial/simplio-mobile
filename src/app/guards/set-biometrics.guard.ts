import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { IdentityVerificationLevel } from '../interface/user';
import { AuthenticationProvider } from '../providers/data/authentication.provider';

@Injectable({
  providedIn: 'root',
})
export class SetBiometricsGuard implements CanActivate {
  readonly BIOMETRICS_URL = ['biometrics'];

  constructor(private router: Router, private authProvider: AuthenticationProvider) {}

  canActivate(): boolean {
    const lvl = this.authProvider.securityLevelValue;
    const asked = lvl > IdentityVerificationLevel.PIN;

    if (asked) return true;

    this.router.navigate(this.BIOMETRICS_URL);
    return false;
  }
}
