import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';

import { SWIPELUX_URL } from '../../providers/routes/swipelux.routes';

export interface InputCurrency {
  currency: string;
  amount: number;
}

export interface Currency {
  name: string;
  code: string;
  a3: string;
  precision: number;
  isFiat: boolean;
  isEnabled: boolean;
  minimum: number;
  maximum: number;
  regex: string;
}

export interface Rate {
  amount: number;
  currency: Currency;
}

export interface CurrencyPair {
  fromCurrency: Currency;
  toCurrency: Currency;
}

export interface RateResponse {
  pair: {
    fromCurrency: Currency;
    toCurrency: Currency;
  };
  rate: Rate;
  updatedAt: Date;
}

export interface OrderData {
  user: {
    phone: string;
  };
  order: {
    from: InputCurrency;
    to: InputCurrency;
  };
}

export interface OrderResponse {
  uid: string;
  expiresAt?: Date;
  createdAt: Date;
  processingType: string;
  orderWithdrawalLast: {
    amount: number;
    target: string;
    expiresAt?: Date;
    cretatedAt: Date;
    currency: Currency;
    orderWithdrawalEventLast: {
      origin: string;
      amount: number;
      feeAmount: number;
      target: string;
      status: string;
      data?: any;
      createdAt: Date;
      currency: Currency;
    };
  };
  orderEventLast: {
    rate: number;
    currentRate: number;
    data?: any;
    status: string;
    createdAt: Date;
  };
  orderPaymentLast: {
    uid: string;
    amount: number;
    origin: string;
    expiresAt?: Date;
    createdAt: Date;
    currency: Currency;
    orderPaymentEventLast: {
      amount: number;
      card4Digits: string;
      status: string;
      data?: any;
      createdAt: Date;
      currency: Currency;
    };
  };
  toAmount: number;
  toCurrency: Currency;
  fromAmount: number;
  fromCurrency: Currency;
  rate: number;
  merchantFeeAmount: number;
  merchantFeeCurrency: Currency;
  feeAmount: number;
  feeCurrency: Currency;
}

const aa = {
  uid: '1fc278e1-35fa-4b28-996c-a17be40d94a4',
  expiresAt: null,
  createdAt: '2021-12-08T16:07:06.051Z',
  processingType: 'AUTO',
  orderWithdrawalLast: {
    amount: 0.02174301,
    target: '0xa10b1dc23fc15e09941d4fd8ee63b70c9a68a7b2',
    expiresAt: null,
    createdAt: '2021-12-08T16:07:21.876Z',
    currency: {
      precision: 8,
      isFiat: false,
      isEnabled: true,
      name: 'Ethereum',
      code: 'ETH',
      a3: 'ETH',
      minimum: 0.00064,
      maximum: 300,
      regex: null,
    },
    orderWithdrawalEventLast: {
      origin: 'local-cold-storage',
      amount: 0.02174301,
      feeAmount: 0,
      target: '0xa10b1dc23fc15e09941d4fd8ee63b70c9a68a7b2',
      status: 'ERROR',
      data: { error: '0xa10b1dc23fc15e09941d4fd8ee63b70c9a68a7b2' },
      createdAt: '2021-12-08T16:08:28.987Z',
      currency: {
        precision: 8,
        isFiat: false,
        isEnabled: true,
        name: 'Ethereum',
        code: 'ETH',
        a3: 'ETH',
        minimum: 0.00064,
        maximum: 300,
        regex: null,
      },
    },
  },
  orderEventLast: {
    rate: 0,
    currentRate: 0,
    data: null,
    status: 'WITHDRAWAL_FAILED',
    createdAt: '2021-12-08T16:08:28.988Z',
  },
  orderPaymentLast: {
    uid: 'fa41e98f-7193-449c-85d7-b97b83f0f828',
    amount: 100,
    origin: 'MERCURYO',
    expiresAt: null,
    createdAt: '2021-12-08T16:07:24.403Z',
    currency: {
      precision: 2,
      isFiat: true,
      isEnabled: true,
      name: 'USD',
      code: '840',
      a3: 'USD',
      minimum: 100,
      maximum: 100000,
      regex: null,
    },
    orderPaymentEventLast: {
      amount: 100,
      card4Digits: '',
      status: 'SUCCESS',
      data: null,
      createdAt: '2021-12-08T16:08:27.427Z',
      currency: {
        precision: 2,
        isFiat: true,
        isEnabled: true,
        name: 'USD',
        code: '840',
        a3: 'USD',
        minimum: 100,
        maximum: 100000,
        regex: null,
      },
    },
  },
  toAmount: 0.02174301,
  toCurrency: {
    precision: 8,
    isFiat: false,
    isEnabled: true,
    name: 'Ethereum',
    code: 'ETH',
    a3: 'ETH',
    minimum: 0.00064,
    maximum: 300,
    regex: null,
  },
  fromAmount: 100,
  fromCurrency: {
    precision: 2,
    isFiat: true,
    isEnabled: true,
    name: 'USD',
    code: '840',
    a3: 'USD',
    minimum: 100,
    maximum: 100000,
    regex: null,
  },
  rate: 4599.18,
  merchantFeeAmount: 0.5,
  merchantFeeCurrency: {
    precision: 2,
    isFiat: true,
    isEnabled: true,
    name: 'USD',
    code: '840',
    a3: 'USD',
    minimum: 100,
    maximum: 100000,
    regex: null,
  },
  feeAmount: 3.5,
  feeCurrency: {
    precision: 2,
    isFiat: true,
    isEnabled: true,
    name: 'USD',
    code: '840',
    a3: 'USD',
    minimum: 100,
    maximum: 100000,
    regex: null,
  },
};

@Injectable({
  providedIn: 'root',
})
export class SwipeluxService {
  constructor(private http: HttpClient) {}

  createOrderAndAuthenticateUser(order: OrderData): Promise<{ token: string; code: string }> {
    const url = SWIPELUX_URL.authenticateAndCreateOrder.href;

    return this.http.post(url, order).toPromise<any>();
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

  getMerchantOrders(): Promise<any> {
    const url = SWIPELUX_URL.merchantOrders.href;

    return this.http.get(url).toPromise();
  }

  getCurrentOrders(): Promise<OrderResponse> {
    const url = SWIPELUX_URL.currentOrders.href;

    return this.http.get(url).toPromise() as any;
  }

  getAllOrders(): Promise<any[]> {
    const url = SWIPELUX_URL.orders.href;

    return this.http.get(url).toPromise() as any;
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

  cancelCurrentPayment(): Promise<any> {
    const url = SWIPELUX_URL.payment.href;

    return this.http.delete(url, {}).toPromise();
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

  getKycToken(): Promise<{ passed: boolean; token?: string }> {
    const url = SWIPELUX_URL.kycVerification.href;

    return this.http
      .get<any>(url, { observe: 'response' })
      .pipe(
        map(res => {
          console.log(183, res);
          if (res.status === 204) {
            return {
              passed: true,
            };
          } else {
            return {
              passed: false,
              token: res.body.token,
            };
          }
        }),
      )
      .toPromise<any>();
  }
}
