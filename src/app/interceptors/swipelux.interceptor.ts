import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable} from '@polkadot/x-rxjs';
import { HeaderFlags, ApiResources } from 'src/app/interface/global';
import { SwipeluxProvider } from '../providers/swipelux/swipelux-provider.service';

@Injectable()
export class SwipeluxInterceptor implements HttpInterceptor {

  constructor(
    private swipeluxProvider: SwipeluxProvider,
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if (req.headers.get(HeaderFlags.ApiResource) !== ApiResources.Swipelux) return next.handle(req);

    const cloned = req.clone({
      setHeaders: {
        Authorization: this.swipeluxProvider.authToken ?? '',
        'x-merchant-key': this.swipeluxProvider.merchantKey ?? '',
      },
    });

    return next.handle(cloned);
  }

}
