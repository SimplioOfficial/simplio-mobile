import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { AuthenticationProvider } from '../providers/data/authentication.provider';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authProvider: AuthenticationProvider) {}

  canActivate(): boolean {
    return this.authProvider.isAuthenticatedValue;
  }
}
