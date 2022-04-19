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
  Validating = 0,
  Pending = 25,
  Swapping = 50,
  Delayed = 60,
  Withdrawing = 75,
  Expired = 97,
  Cancelled = 98,
  Failed = 99,
  Completed = 100,
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
  BUY,
  SELL,
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

export enum Currency {
  TENT = 1,
  ZEL = 2,
  LTC = 3,
  DGB = 4,
  BTC = 5,
  DOGE = 6,
  BTCZ = 7,
  ETH = 8,
  USDT = 9,
  TRX = 10,
  BTT = 11,
  LINK = 12,
  ZEC = 13,
  EUR = 14,
  USD = 15,
  GBP = 16,
  CHF = 17,
  BUSD = 18,
  BNB = 19,
  OK = 20,
  USDC = 21,
  DASH = 22,
  EURT = 23,
  BCH = 24,
  SOL = 25,
  SIO = 26,
  AAVE = 27,
  ANKR = 28,
  AXS = 29,
  BAND = 30,
  BAT = 31,
  BNT = 32,
  CAKE = 33,
  CHZ = 34,
  COMP = 35,
  CRV = 36,
  DAI = 37,
  ENJ = 38,
  ETC = 39,
  GRT = 40,
  HOLO = 41,
  LUNA = 42,
  MANA = 43,
  MATIC = 44,
  MDX = 45,
  MKR = 46,
  PAXG = 47,
  PERP = 48,
  QNT = 49,
  RAY = 50,
  REN = 51,
  RENBTC = 52,
  SHIB = 53,
  SNX = 54,
  SUSHI = 55,
  TUSD = 56,
  UMA = 57,
  UNI = 58,
  VGX = 59,
  WBTC = 60,
  YFI = 61,
  ZRX = 62,
  USDP = 63,
  C98 = 64,
  FIDA = 65,
  FTT = 66,
  SRM = 67,
  BSC = 68,
  IMX = 69,
  ELON = 70,
  SKL = 71,
  CEEK = 72,
  RLC = 73,
  OXT = 74,
  SOUL = 75,
  RLY = 76,
  ILV = 77,
  TTT = 78,
  MBOX = 79,
  YOOSHI = 80,
  ALT = 81,
  WTC = 82,
  WILD = 83,
  BTRST = 84,
  DAR = 85,
  SFP = 86,
  EXRD = 87,
  ANY = 88,
  PROM = 89,
  REQ = 90,
  TLM = 91,
  CTK = 92,
  ENS = 93,
  GALA = 94,
  IDEX = 95,
  RSR = 96,
  YGG = 97,
  SLP = 98,
  CTSI = 99,
  SANTOS = 100,
  PORTO = 101,
  LAZIO = 102,
  JASMY = 103,
  RNDR = 104,
  MITH = 105,
  TVK = 106,
  POWR = 107,
  BADGER = 108,
  CHESS = 109,
  DODO = 110,
  LIT = 111,
  BAKE = 112,
  AGLD = 113,
  AKRO = 114,
  WRX = 115,
  KEY = 116,
  BZRX = 117,
  BLZ = 118,
  ALPHA = 119,
  POLS = 120,
  KEEP = 121,
  PNT = 122,
  PLA = 123,
  LINA = 124,
  SOLR = 125,
  COBAN = 126,
  MDT = 127,
  BNX = 128,
  VITE = 129,
  RARE = 130,
  MFT = 131,
  DEGO = 132,
  INJ = 133,
  GHST = 134,
  KP3R = 135,
  MTL = 136,
  BEL = 137,
  MC = 138,
  GTO = 139,
  BIFI = 140,
  DEXE = 141,
  TRB = 142,
  TRIBE = 143,
  XVS = 144,
  GTC = 145,
  KNC = 146,
  TKO = 147,
  FIS = 148,
  BURGER = 149,
  IRIS = 150,
  UTK = 151,
  DUSK = 152,
  CHR = 153,
  TRU = 154,
  SUPER = 155,
  DNT = 156,
  IQ = 157,
  BRD = 158,
  WIN = 159,
  OCEAN = 160,
  COTI = 161,
  NU = 162,
  COCOS = 163,
  IOTX = 164,
  PYR = 165,
  RAD = 166,
  POND = 167,
}

export enum CurrencyNetwork {
  TENT = 1,
  ZEL = 2,
  LTC = 3,
  DGB = 4,
  BTC = 5,
  DOGE = 6,
  BTCZ = 7,
  ETH = 8,
  TRX = 10,
  OMNI = 11,
  ZEC = 12,
  FIAT_MONEY = 13,
  BNB = 14,
  OK = 15,
  DASH = 16,
  BCH = 17,
  SOL = 18,
  BSC = 19,
  ETC = 20,
  BTT = 21,
}
