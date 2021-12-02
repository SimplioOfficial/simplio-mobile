import { AddrUtxo, FeeTx, GasTx, Wallet, WalletType } from './data';
import { Explorer } from './explorer';

export interface ITransactionData<T> {
  type: WalletType;
  amount;
  source;
  pair;
  value(): T;
  sign?(signature: TxSignature);
}

export type SwapTransactionParty = {
  wallet: Wallet | null;
  address: string;
  ticker: string;
};

export type TxSignature = {
  amount: number;
  fee: number;
  rawtx: string;
};

type PartialSingleSwapTransaction = {
  sourceTxId: string;
  sourceInitialAmount: number;
  targetAddress: string;
  refundAddress: string;
};

type GenericSwapTransaction = {
  targetPrice: number;
  referenceCode: string;
  userAgreedAmount: number;
  label1: string;
  label2: string;
  label3: string;
  sourceCurrency: string;
  sourceCurrencyNetwork: string;
  targetCurrency: string;
  targetCurrencyNetwork: string;
  targetExchangeEndpoint: string;
};

export type SingleSwapTransaction = GenericSwapTransaction & PartialSingleSwapTransaction;

export type AddAddressesRequestBody = {
  currency: string;
  currencyNetwork: string;
  addresses: string[];
};

export type SwapSingleResponse = {
  sourceTxId: string;
  targetAddress: string;
  refundAddress: string;
  targetPrice: number;
  referenceCode: string;
  sourceInitialAmount: number;
  userAgreedAmount: number;
  label1: string;
  label2: string;
  label3: string;
  sourceCurrency: string;
  sourceCurrencyNetwork: string;
  sourceInitialAmountInFiat: number;
  sourceTxFee: number;
  usdToEurRate: number;
  targetCurrency: string;
  targetCurrencyNetwork: string;
  targetExchangeEndpoint: ExchangeType;
  targetInitialAmountInFiat: number;
};

export type SwapSingleUpdate = {
  sagaId: string;
  price: number;
};

export type SwapCache = {
  pending?: SwapReportItem[];
  items?: SwapReportItem[];
};

export type SwapHistory = {
  email: string;
  sourcetxid: string;
  sourcewallet: string;
  sourcecurrency: string;
  sourceamount: string;
  targetwallet: string;
  targetcurrency: string;
  targetamount: string;
  refundaddress: string;
  targetprice: number;
  referenceCode?: string;
  unixtime: number;
  swapstatus: SwapStatus;
};

export enum SwapStatus {
  Validating = 20,
  Pending = 40,
  Swapping = 60,
  Delayed = 61,
  Withdrawing = 80,
  Completed = 100,
  Failed = 0,
  Cancelled = 98,
}

export enum SwapStatusText {
  Validating = 'Validating',
  Pending = 'Pending',
  Swapping = 'Swapping',
  Withdrawing = 'Withdrawing',
  Completed = 'Completed',
  Delayed = 'Delayed',
  Failed = 'Failed',
  Expired = 'Expired',
}

export enum SwapType {
  Single = 'Single',
}

export interface SwapReportRequest {
  pageNumber: number;
  pageSize: number;
  swapStatus: SwapStatusText | SwapStatusText[];
}

export type SwapStatusTranslations = Partial<Record<SwapStatusText, string>>;

export interface SwapConvertRequestParams {
  SourceAmount?: number;
  SourceCurrency?: string;
  SourceCurrencyNetwork?: string;
  TargetCurrency?: string;
  TargetCurrencyNetwork?: string;
  TargetExchangeEndpoint?: string | ExchangeType;
  PaymentGateways?: PaymentType[]; // only for purchases
}

export type ExchangeType =
  | string
  | 'ExchangeBinance'
  | 'ExchangeStex'
  | 'ExchangeBitrex'
  | 'ExchangeKraken'
  | 'ExchangeCoinbase';

export interface SwapReportRequestParams extends SwapReportRequest {
  swapType: SwapType;
}

export type SwapReportItem = {
  Cancelled: boolean;
  CurrencyPairName: string;
  ExchangeEndpoint: string;
  Label1: string;
  Label2: string;
  Label3: string;
  OrderType: OrderTypes;
  SagaId: string;
  SourceCurrency: string;
  SourceCurrencyDisplay: string;
  SourceCurrencyNetwork: string;
  SourceInitialAmount: number;
  SourceInitialAmountInFiat: number;
  SourceRefundAddress: string;
  SourceRefundAmount: number;
  SourceRemainingAmount: number;
  SourceTxFee: number;
  SourceWithdrawalFee: number;
  StartedAt: string;
  StartedAtUnixTime: number;
  Status: SwapStatusText;
  SwapType: SwapType;
  TargetAddress: string;
  TargetCurrency: string;
  TargetCurrencyNetwork: string;
  TargetPrice: number;
  TargetInitialAmountInFiat: number;
  TargetPurchasedAmount: number;
  TargetWithdrawalAmount: number;
  TargetWithdrawalFee: number;
  TargetWithdrawalTxId: string;
  TotalSwapFee: number;
  UpdatedAt: string;
  UpdatedAtUnixTime: number;
  UsdToEurRate: number;
  UserAgreedAmount: number;
  UserId: string;
};

export type SwapReportPage = {
  MetaData: {
    PageCount: number;
    TotalItemCount: number;
    PageNumber: number;
    PageSize: number;
    HasPreviousPage: boolean;
    HasNextPage: boolean;
    IsFirstPage: boolean;
    IsLastPage: boolean;
    FirstItemOnPage: number;
    LastItemOnPage: number;
  };
  Items: SwapReportItem[];
};

export type SwapConnectionReport = SwapReportItem;
export type PaymentStatusConnection = {
  SagaId: string;
  UserId: string;
  ConnectionId: string;
};

export enum OrderTypes {
  BUY = 'BUY',
  SELL = 'SELL',
}

export type SwapPair = {
  ExchangeEndpoint: ExchangeType;
  SwapType: SwapType;
  SourceCurrency: string;
  SourceCurrencyNetwork: string;
  SourceDepositAddress: string;
  TargetCurrency: string;
  TargetCurrencyNetwork: string;
  IsEnabled: boolean;
};

type SwapConvert<T> = T & {
  SourceMinDepositAmount: number;
  SourceCurrentAmount: number;
  SourceMaxDepositAmount: number;
  TargetMinWithdrawalAmount: number;
  TargetEstimatedWithdrawalAmount: number;
  TargetGuaranteedPrice: number;
  TargetGuaranteedWithdrawalAmount: number;
  MinTradeAmount: number;
  IsSourceCurrentAmountValid: boolean;
  IsEnabled: false;
};

export type SwapConvertResponse = SwapConvert<{
  SourceWithdrawalFee: number;
  TargetWithdrawalFee: number;
  TotalSwapFee: number;
}>;

type OrderBookItem = {
  Amount: number;
  Amount2: number;
  Price: number;
  TimeStamp: number;
};

export type BuySwapConvert = SwapConvert<{
  SourceCurrentAmountFeePercent: number;
  SourceCurrentAmountFee: number;
  SourceCurrentAmountTotal: number;
  SourceAmountScale: number;
  ExchangeEndpoint: ExchangeType;
  SelectedOrderBookItems: OrderBookItem[];
  PaymentGatewayProvider: PaymentType;
  PaymentGatewayProviderEnabled: boolean;
  OrderType: OrderTypes;
  CacheType: string;
}>;

export type BuySwapConvertResponse = BuySwapConvert | BuySwapConvert[];

export type PaymentData = {
  SagaId: string;
  Reservation: string;
};

export type PaymentResponse = {
  WalletOrderId: string;
  Reservation: string;
  AuthCodesRequested: boolean;
};

export type PaymentRetryResponse = {
  // WalletOrderId: string;
  // Reservation: string;
  // AuthCodesRequested: boolean;
  AuthType: PaymentAuthorizationType;
  Type: string;
  WalletOrderId: string;
  Reservation: string;
  SmsNeeded: boolean;
  Card2faNeeded: boolean;
  Status: string;
  ErrorCategory?: string;
  ErrorCode?: string;
  ErrorMessage?: string;
};

export type PaymentAuthorization = {
  type: PaymentAuthorizationType;
  walletOrderId: string;
  reservation: string;
  smsCode: string;
  card2fa: string;
};

export enum PaymentAuthorizationType {
  SMS = 'SMS',
  CARD2FA = 'CARD2FA',
  ALL = 'ALL',
  NONE = 'NONE',
}

export type PaymentDirectAuthorization = {
  type: PaymentAuthorizationType;
  walletOrderId: string;
  reservation: string;
  sms: string;
  card2fa: string;
};

export type PaymentCard = {
  number: string;
  year: string;
  month: string;
  cvv: string;
};

export type PaymentPay = {
  clientIpAddress: string;
  debitCard: PaymentCard;
};

export type SwapBuyResponse = {
  OrderId: string;
  IframeCheckout: string;
  DirectPost?: string;
};

export type SwapTransaction<T> = {
  pair: SwapPair;
  swap: SwapConvertResponse;
  source: {
    wallet: Wallet;
    mnemo: string;
    utxo: AddrUtxo[];
    fee: FeeTx;
    gas?: GasTx;
    nonce?: string;
    isMax?: boolean;
    explorer: Explorer;
  };
  feepipe: {
    type: WalletType;
    ticker: string;
    rate?: number;
    decimal: number;
  };
  gas?: {
    value: number;
    limit: number;
  };
  target: {
    wallet: Wallet;
    depositAddress: string;
  };
  token?: {
    data: string;
    address: string;
  };
  nonce?: string;
  referenceCode?: string;
  sourceTxId?: string;
  signature?: T;
};

export enum PaymentType {
  WYRE = 'WYRE',
  DECTA = 'DECTA',
}
