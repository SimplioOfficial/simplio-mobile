import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import {
  AllOrdersResponse,
  Currency,
  CurrencyPair,
  OrderData,
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

  authenticateTemp(): Promise<any> {
    const url = SWIPELUX_URL.authenticateTemp;

    return this.http.post(url, { login: 'simplio', password: '9vx5hQKnB295g6ba' }).toPromise();
  }

  cancelCurrentPayment(): Promise<any> {
    const url = SWIPELUX_URL.payment.href;

    return this.http.delete(url, {}).toPromise();
  }

  createOrderAndAuthenticateUser(order: OrderData): Promise<{ token: string; code: string }> {
    const url = SWIPELUX_URL.authenticateAndCreateOrder.href;

    return this.http.post(url, order).toPromise<any>();
  }

  createOrderByShareToken(
    order: OrderDataWithToken,
  ): Promise<{ accessToken: string; orderId: string }> {
    const url = SWIPELUX_URL.orders.href;

    return this.http.post(url, order).toPromise<any>();
  }

  getAllOrders(params?: any): Promise<{ items: AllOrdersResponse[]; pageInfo: any }> {
    const url = SWIPELUX_URL.orders.href;

    return this.http
      .get(url, {
        params: getParams({
          sort: 'createdAt',
          dir: 'desc',
          ...params,
        }),
      })
      .toPromise() as any;
  }

  getCurrencies(currencyId?: string): Promise<{ items: Currency[]; pageInfo: any }> {
    const url = `${SWIPELUX_URL.currencies.href}/${currencyId ?? ''}`;

    return this.http
      .get(url, {
        params: {
          limit: 999,
        },
      })
      .toPromise<any>();
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

  getMerchantOrders(): Promise<any> {
    const url = SWIPELUX_URL.merchantOrders.href;

    return this.http.get(url).toPromise();
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

  getRateFromTo(fromCurrency: string, toCurrency: string): Promise<RateResponse> {
    const url = `${SWIPELUX_URL.fromTo.href}/${fromCurrency}/${toCurrency}/rate`;

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

  setAddress(address: string): Promise<any> {
    const url = SWIPELUX_URL.address.href;

    return this.http.put(url, { address }).toPromise();
  }

  setEmail(email: string): Promise<{ code: string }> {
    const url = SWIPELUX_URL.email.href;

    return this.http.put(url, { email, subscribe: true }).toPromise<any>();
  }

  verifyEmail(code: string): Promise<{ passed: boolean }> {
    const url = SWIPELUX_URL.emailVerification.href;

    return this.http
      .post(url, { code })
      .toPromise()
      .then(res => {
        console.error(res);
        return { passed: false };
      })
      .catch(e => {
        return { passed: e.status === 201 };
      });
  }

  verifyPhone(code: string): Promise<{ passed: boolean }> {
    const url = SWIPELUX_URL.phoneVerification.href;

    return this.http
      .post(url, { code })
      .toPromise()
      .then(res => {
        console.error(res);
        return { passed: false };
      })
      .catch(e => {
        return { passed: e.status === 201 };
      });
  }
}
