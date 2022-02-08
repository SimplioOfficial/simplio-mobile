import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import {
  OrdersResponse,
  CurrencyPair,
  OrderDataWithToken,
  OrderResponse,
  RateResponse,
} from '../../interface/swipelux';

import { SWIPELUX_URL } from '../../providers/routes/swipelux.routes';
import { getParams } from '../authentication/utils';

@Injectable({
  providedIn: 'root',
})
export class SwipeluxService {
  constructor(private http: HttpClient) {}

  cancelCurrentPayment(): Promise<any> {
    const url = SWIPELUX_URL.payment.href;

    return this.http.delete(url, {}).toPromise();
  }

  createOrderByShareToken(
    order: OrderDataWithToken,
  ): Promise<{ accessToken: string; orderId: string }> {
    const url = SWIPELUX_URL.orders.href;

    return this.http.post(url, order).toPromise<any>();
  }

  getAllOrders(params?: any): Promise<{ items: OrdersResponse[]; pageInfo: any }> {
    const url = SWIPELUX_URL.orders.href;

    return this.http
      .get(url, {
        params: getParams({
          sort: 'created_at',
          dir: 'desc',
          ...params,
        }),
      })
      .toPromise() as any;
  }

  getCurrentOrder(): Promise<OrderResponse> {
    const url = SWIPELUX_URL.currentOrders.href;

    return this.http.get(url).toPromise() as any;
  }

  getKycStatus(): Promise<{ passed: boolean; origin?: string; token?: string }> {
    const url = SWIPELUX_URL.kycVerification.href;

    return this.http
      .get<any>(url, { observe: 'response' })
      .pipe(
        map(res => {
          if (res.status === 200) {
            return { passed: false, ...res.body };
          } else if (res.status === 204) {
            return { passed: true };
          } else {
            return { passed: false };
          }
        }),
      )
      .toPromise<any>();
  }

  getPairs(): Promise<{ items: CurrencyPair[]; pageInfo: any }> {
    const url = SWIPELUX_URL.pairs.href;

    return this.http
      .get(url, {
        params: {
          limit: 999,
        },
      })
      .toPromise<any>();
  }

  getRateFromTo(fromCcy: string, toCcy: string): Promise<RateResponse> {
    const url = `${SWIPELUX_URL.fromTo.href}/${fromCcy}/${toCcy}/rate`;

    return this.http.get(url).toPromise<any>();
  }

  initializePayment(): Promise<{
    origin: string;
    paymentUrl: string;
    uid: string;
  }> {
    const url = SWIPELUX_URL.payment.href;

    return this.http.get(url).toPromise<any>();
  }
}
