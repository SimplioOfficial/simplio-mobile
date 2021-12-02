import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthenticationProvider } from '../providers/data/authentication.provider';

@Injectable({
  providedIn: 'root',
})
export class IsSecuredGuard implements CanActivate {
  readonly PIN_URL = ['pin'];

  constructor(private router: Router, private authProvider: AuthenticationProvider) {}

  canActivate(): boolean {
    const isSecured = this.authProvider.isSecuredValue;

    if (isSecured) return true;

    this.router.navigate(this.PIN_URL);
    return false;
  }
}
