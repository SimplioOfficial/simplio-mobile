import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { from, Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { MasterSeedService } from 'src/app/services/master-seed.service';
import { AuthenticationProvider } from '../providers/data/authentication.provider';

@Injectable({
  providedIn: 'root',
})
export class SetCustomSeedGuard implements CanActivate {
  readonly RECOVERY_URL = ['recovery'];

  constructor(
    private router: Router,
    private authProvider: AuthenticationProvider,
    private msed: MasterSeedService,
  ) {}

  canActivate(): Observable<boolean> {
    return this.authProvider.canRecover$.pipe(
      map(canRecover => {
        if (canRecover) return canRecover;
        else throw new Error();
      }),
      switchMap(_ =>
        from(this.msed.getMasterSeed()).pipe(
          map(msed => !!msed),
          map(hasMsed => {
            if (hasMsed) return true;

            this.router.navigate(this.RECOVERY_URL);
            return false;
          }),
        ),
      ),
      catchError(_ => of(true)),
    );
  }
}
