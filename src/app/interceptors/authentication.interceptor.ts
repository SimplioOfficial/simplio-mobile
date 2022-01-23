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
import { Acc } from 'src/app/interface/user';
import { AuthenticationProvider } from 'src/app/providers/data/authentication.provider';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { environment } from '../../environments/environment';
import { SwipeluxProvider } from '../providers/swipelux/swipelux-provider.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private _isRefreshing = false;
  private _acc = new BehaviorSubject<Acc>(null);

  constructor(
    private auth: AuthenticationService,
    private swipeluxProvider: SwipeluxProvider,
    private authProvider: AuthenticationProvider,
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const acc = this.authProvider.accountValue;
    if (!acc) return next.handle(req);

    // requests to swipelux needs to be authorized with different token
    if (req.url.includes(environment.SWIPELUX) || req.url.includes(environment.SWIPELUX_NEW)) {
      const cloned = req.clone({
        setHeaders: {
          Authorization: this.swipeluxProvider.authToken ?? '',
          'x-merchant-key': this.swipeluxProvider.merchantKey ?? '',
        },
      });

      return next.handle(cloned);
    }

    req = this._authorize(req, acc);

    return next.handle(req).pipe(
      catchError(err => {
        if (err instanceof HttpErrorResponse && err.status === 401) {
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
    if (this._isRefreshing) return this._addToken(req, next);
    else return this._refreshToken(req, next);
  }

  private _refreshToken(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this._isRefreshing = true;
    this._acc.next(null);

    const acc = this.auth.refresh(this.authProvider.accountValue).then(acc => {
      this._acc.next(acc);
      return acc;
    });

    return from(acc).pipe(
      tap(() => (this._isRefreshing = false)),
      switchMap(acc => next.handle(this._authorize(req, acc))),
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
