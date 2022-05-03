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
  amounts: {
    from: {
      amount: string;
      currency: Currency;
    };
    to: {
      amount: string;
      currency: Currency;
    };
  };
  fee: {
    rate: string;
    details: [{ provider: string; currency: string; amount: string }];
  };
  fees: {
    MERCHANT: Fee;
    RECV_XACT: Fee;
    SEND_XACT: Fee;
    SYSTEM: Fee;
  };
  rate: number;
  rateTtl: number;
}

export interface Fee {
  amounts: {
    USD?: string;
    EUR?: string;
  };
  baseCurrency: string;
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

export interface OrdersResponse {
  createdAt: Date;
  email: string;
  fromAmount: number;
  fromCcy: { name: string; a3: string };
  id: number;
  income: number;
  merchantId: number;
  phone: string;
  status: OrderStatus;
  toAmount: number;
  toCcy: { name: string; a3: string };
  uid: string;
  wallet: string;
}

export enum OrderStatus {
  QUOTE_ASSIGNED = 'QUOTE_ASSIGNED',
  EXTERNAL_ORDER_STARTED = 'EXTERNAL_ORDER_STARTED',
  PHONE_ENTERED = 'PHONE_ENTERED',
  PHONE_VERIFICATION_CODE_SENT = 'PHONE_VERIFICATION_CODE_SENT',
  PHONE_VERIFICATION_FAILED = 'PHONE_VERIFICATION_FAILED',
  PHONE_VERIFIED = 'PHONE_VERIFIED',
  EMAIL_ENTERED = 'EMAIL_ENTERED',
  EMAIL_VERIFICATION_CODE_SENT = 'EMAIL_VERIFICATION_CODE_SENT',
  EMAIL_VERIFICATION_FAILED = 'EMAIL_VERIFICATION_FAILED',
  EMAIL_VERIFIED = 'EMAIL_VERIFIED',
  TARGET_ADDRESS_ENTERED = 'TARGET_ADDRESS_ENTERED',
  KYC_INIT = 'KYC_INIT',
  KYC_IMPORTED = 'KYC_IMPORTED',
  KYC_REJECTED = 'KYC_REJECTED',
  KYC_PASSED = 'KYC_PASSED',
  KYC_SKIPPED = 'KYC_SKIPPED',
  KYC_FAILED = 'KYC_FAILED',
  AMOUNT_UPDATED = 'AMOUNT_UPDATED',
  PAYMENT_INIT = 'PAYMENT_INIT',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  PAYMENT_COMPLETED = 'PAYMENT_COMPLETED',
  PROCESSING_INIT = 'PROCESSING_INIT',
  PROCESSING_COMPLETED = 'PROCESSING_COMPLETED',
  PROCESSING_FAILED = 'PROCESSING_FAILED',
  WITHDRAWAL_INIT = 'WITHDRAWAL_INIT',
  WITHDRAWAL_IN_PROGRESS = 'WITHDRAWAL_IN_PROGRESS',
  WITHDRAWAL_COMPLETED = 'WITHDRAWAL_COMPLETED',
  WITHDRAWAL_FAILED = 'WITHDRAWAL_FAILED',
  PAYMENT_ROLLBACK_INIT = 'PAYMENT_ROLLBACK_INIT',
  ROLLBACK_SUCCESS = 'ROLLBACK_SUCCESS',
  ROLLBACK_FAILED = 'ROLLBACK_FAILED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  TIMEOUT = 'TIMEOUT',
}

export enum VerificationType {
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
}
