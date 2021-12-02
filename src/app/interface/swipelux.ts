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

export interface OrderDataWithToken {
  currencyPair: {
    from: string;
    to: string;
  };
  shareToken: string;
  targetAddress: string;
  targetAmount: number;
}

export interface MerchantSettings {
  allowFixTargetAddress: boolean;
  logoUrl: string;
  title: string;
  webhook?: any;
}

export interface OrderEvent {
  rate: number;
  currentRate: number;
  data?: any;
  status: string;
  createdAt: Date;
}

export interface OrderWithdrawal {
  amount: number;
  target: string;
  expiresAt?: Date;
  createdAt: Date;
  currency: Currency;
  orderWithdrawalEventLast?: {
    origin: string;
    amount: number;
    feeAmount: number;
    target: string;
    status: string;
    data?: any;
    createdAt: Date;
    currency: Currency;
  };
}

export interface UserData {
  createdAt: Date;
  email: string;
  id: number;
  phone: string;
  role: string;
  status: string;
  updatedAt: Date;
}

export enum VerificationType {
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
}

export interface VerificationData {
  createdAt: Date;
  expiresAt: Date;
  id: number;
  orderId: number;
  token: string;
  type: VerificationType;
  userId: number;
  value: string;
}

export interface OrderResponse {
  uid: string;
  expiresAt?: Date;
  createdAt: Date;
  processingType: string;
  orderWithdrawalLast: OrderWithdrawal;
  orderEventLast: OrderEvent;
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

export interface AllOrdersResponse {
  createdAt: Date;
  currencyPair?: CurrencyPair;
  expiresAt?: Date;
  merchant?: {
    apiKey: string;
    createdAt: Date;
    updatedAt: Date;
    fee: number;
    id: number;
    name: string;
    settings: MerchantSettings;
  };
  orderAmountLast?: {
    feeAmount: number;
    feeCurrency: Currency;
    fromAmount: number;
    merchantFeeAmount: number;
    merchantFeeCurrency: Currency;
    rate: number;
    toAmount: number;
  };
  orderEventLast: OrderEvent;
  orderWithdrawalLast: OrderWithdrawal;
  processingType: string;
  uid: string;
  user: UserData;
  verificationEmail: VerificationData;
  verificationPhone: VerificationData;
}
