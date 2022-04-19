import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable, throwError } from '@polkadot/x-rxjs';
import { catchError, filter, switchMap, take, tap } from 'rxjs/operators';
import { HeaderFlags, ApiResources } from 'src/app/interface/global';
import { Acc } from 'src/app/interface/user';
import { AuthenticationProvider } from 'src/app/providers/data/authentication.provider';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private _acc = new BehaviorSubject<Acc>(null);

  constructor(
    private auth: AuthenticationService,
    private authProvider: AuthenticationProvider,
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if (req.headers.get(HeaderFlags.ApiResource) !== ApiResources.Simplio) return next.handle(req);

    const acc = this.authProvider.accountValue;
    if (!acc) return next.handle(req);

    req = this._authorize(req, acc);

    return next.handle(req).pipe(
      catchError(err => {
        if (err instanceof HttpErrorResponse && (err.status === 401 || err.status === 0)) {
          return this._handleUnauthorizedError(req, next);
        }

        return throwError(err);
      }),
    );
  }

  private _authorize(req: HttpRequest<any>, acc: Acc): HttpRequest<any> {
    return req.clone<any>({
      setHeaders: {
        Authorization: [acc.tkt, acc.atk].join(' '),
      },
    });
  }

  private _handleUnauthorizedError(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    return this.authProvider.isRefreshing$.pipe(
      take(1),
      switchMap(isRefrehing => {
        if (isRefrehing) return this._addToken(req, next);
        else return this._refreshToken(req, next);
      })
    );
  }

  private _refreshToken(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.authProvider.pushIsRefreshing(true);
    this._acc.next(null);

    return from(this.auth.refresh(this.authProvider.accountValue)).pipe(
      tap(acc => this._acc.next(acc)),
      switchMap(acc => next.handle(this._authorize(req, acc))),
      tap(() => this.authProvider.pushIsRefreshing(false)),
    );
  }

  private _addToken(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this._acc.pipe(
      filter(acc => !!acc),
      take(1),
      switchMap(acc => next.handle(this._authorize(req, acc))),
    );
  }
}
