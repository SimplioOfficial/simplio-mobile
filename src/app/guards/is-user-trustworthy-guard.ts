import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthenticationProvider } from 'src/app/providers/data/authentication.provider';

@Injectable({
  providedIn: 'root'
})
export class IsUserTrustworthyGuard implements CanActivate {
  constructor(private router: Router, private authProvider: AuthenticationProvider) {}

  async canActivate(): Promise<boolean> {
    const [isVerified, _] = this.authProvider.isVerifiedValue;
    if (isVerified) return true;

    this.router.navigate(['/home', 'user', 'account', 'lock']);
    return false;
  }
}
