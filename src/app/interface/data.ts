import { CacheData } from './cache';
import { Explorer } from './explorer';
import { ID, UserID, UUID } from './global';
import { Settings } from './settings';
import { SwapTransaction } from './swap';
export interface Data {
  wallets: Wallet[];
}

export interface MasterSeed {
  uid: UserID; // user id
  sed: string; // Mater seed itself  - encrypted with salt
  bck: boolean; // Is master seed backed up
}
export interface Wallet {
  _p: number; // position in the list
  _uuid: UUID;
  uid: UserID;
  name: string;
  type: WalletType;
  origin?: string;
  ticker: string;
  balance: number; // in satoshi
  unconfirmed: number; // count unconfirmed transaction
  mnemo: string; // encrypted
  mainAddress: string;
  tokenAddress?: string;
  isActive: boolean;
  isRescanning: boolean;
  lasttx: string;
  lastblock: number;
  decimal?: number;
  contractaddress?: string;
  api?: string;
  addresses: WalletAddress[];
  transactions?: Transaction[];
  isInitialized: boolean;
  uniqueId: number;
  addressType: AddressType;
}
export interface WalletAddress {
  _uuid: UUID; // Wallets uuid that the address belongs to
  derivePath: string;
  address: string;
  balance: number;
}

export interface Address {
  name?: string;
  derivePath: string;
  address: string;
  balance: number;
}

export enum AddressType {
  DEFAULT = 1,
  HD
}

export enum WalletType {
  BITCORE_ZCASHY = 0,
  ETH = 1,
  ETH_TOKEN = 2,
  BITCORE_LIB = 4,
  BITCORE_CUSTOM = 5,
  BSC = 10,
  BSC_TOKEN = 11,
  ETC = 15,
  SOLANA = 30,
  SOLANA_TOKEN = 31,
  SOLANA_DEV = 32,
  SOLANA_TOKEN_DEV = 33,
  POLKADOT = 40,
  TRX = 50,
  CUSTOM_TOKEN = 999998,
  UNKNOWN = 999999,
}

export enum TokenType {
  SOLANA_TOKEN = 'SPL Token',
  ETH_TOKEN = 'ERC20 Token',
  BSC_TOKEN = 'BEP20 Token',
}

export enum SeedType {
  BIP44 = 'BIP44',
}

export enum FeeName {
  SUPER_ECONOMY = 'Super Economy',
  ECONOMY = 'Economy',
  NORMAL = 'Normal',
  PRIORITY = 'Priority',
  URGENT = 'Urgent',
}

export interface Transaction {
  id?: ID;
  _uuid: UUID; // uuid of a wallet
  type: TxType;
  ticker: string;
  address: string;
  amount: number;
  hash: string;
  unix: number;
  date: string;
  confirmed: boolean;
  block: number; // slot in solana
}

export enum TxType {
  SEND = 0,
  RECEIVE,
  MOVE,
  // Solana
  SUCCESS = 10,
  ERROR,
  PROGRAM,
  TOKEN,
  UNKNOWN = 9999,
}

export interface TransactionAPI {
  from: number;
  to: number;
  explorer: Explorer;
  totalItems?: number;
  items?: TransactionAPIItem[];
  tokenItem?: EthTransaction[];
  solanaTxs?: any;
  polkadotTxs?: any[];
}

export interface TransactionAPIItem {
  blockhash?: string;
  blockHash?: string;
  blockheight?: number;
  blockHeight?: number;
  blocktime?: number;
  blockTime?: number;
  confirmations: number;
  fOverwintered: boolean;
  fees: number;
  locktime: number;
  nExpiryHeight: number;
  nVersionGroupId: number;
  outputDescs: OutputDescs[];
  size: number;
  time: number;
  txid: string;
  valueBalance: number;
  valueIn: number;
  valueOut: number;
  version: number;
  vin: [
    {
      addr: string;
      addresses?: string[];
      doubleSpentTxID: any;
      n: number;
      scriptSig: {
        asm: string;
        hex: string;
      };
      sequence: number;
      txid: string;
      value: number;
      valueZat: number;
      valueSat: number;
      vout: number;
    },
  ];
  vjoinsplit: any; // ned update
  vout: TransactionVout[];
}

export interface EthTransaction {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  nonce: string;
  blockHash: string;
  transactionIndex: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  isError: string;
  txreceipt_status: string;
  input: string;
  contractAddress: string;
  cumulativeGasUsed: string;
  gasUsed: string;
  confirmations: string;
}

export interface OutputDescs {}

export interface SpendDescs {}

export interface Vin {
  addr: string;
  doubleSpentTxID: any;
  n: number;
  scriptSig: {
    asm: string;
    hex: string;
  };
  sequence: number;
  txid: string;
  value: number;
  valueZat: number;
  vout: number;
}

export interface Contacts {
  [ticker: string]: Pair[];
}

export interface Pair {
  uuid: string;
  name: string;
  address: string;
  customImg: string;
}

export interface AddrUtxo {
  address: string;
  txid: string;
  vout: number;
  scriptPubKey?: string;
  amount?: number;
  satoshis: number;
  height: number;
  confirmations: number;
}

export interface AddrBalance {
  addrStr: string;
  balanceSat: number;
}

export interface Database {
  [accounts: string]: Account;
}

export interface Account {
  email: string;
  recover: string;
  check: string;
  data?: string; // encrypted data
  seeds?: string;
  history?: History[];
  his?: WalletHistory[];
}

export interface HistoryItem {
  unixtime: number;
  balance: number;
}

export interface History extends HistoryItem {
  uid: UserID;
}

export interface WalletHistory extends History {
  _uuid: UUID;
}

export interface AccountData {
  wallets: Data;
  swaps: {
    pending: SwapTransaction<SignedTransaction>[];
  };
  cache: CacheData;
  contacts: Contacts;
  settings: Settings;
}

export interface WalletsData {
  wallets: Wallet[];
  primaryWallet: Wallet;
}

export enum AccentColor {
  default = '0',
  blue = 'blue',
  red = 'red',
  orange = 'orange',
}

export enum ThemeMode {
  auto,
  dark,
  light,
}

export enum ChartView {
  Day = '1D',
  Week = '1W',
  Month = '1M',
  Quarter = '3M',
}

export enum TxRefreshInterval {
  Frequently = 60,
  Often = 90,
  Default = 120,
  Regularly = 180,
  Sometimes = 300,
}

export type SupportedFiat = 'USD' | 'EUR' | string;

export type Rate = {
  code: string;
  name: string;
  price: number;
  rate: number;
  symbol: string;
};

export type FeeResponse = Record<string, FeeResponseBody>;

export type FeeResponseBody = {
  minFee: number;
  feeLevels: Fee[];
};

export type FeeResponsev2 = Record<string, FeeResponseBodyv2>;
export type FeeResponseBodyv2 = {
  minFee: number;
  value: number;
};

export type BnbFeeResponseBody = {
  id: number;
  jsonrpc: string;
  result: string;
};

export type FeeItem = {
  min: number;
  value: number;
  name: string;
};

export type Fee = {
  id: number;
  name: string;
  value: number;
};

export type FeeTx = {
  name: string;
  value: number;
  price: number;
  minFee: number;
  feeSatoshi?: number;
  feePercent?: number;
  feeText?: string;
  type: WalletType;
  ticker: string;
};

export type GasTx = {
  value: number;
  limit: number;
};

export type TransactionVout = {
  value: number;
  n: number;
  scriptPubKey: {
    hex: string;
    asm: string;
    addresses?: string[];
    type: string;
  };
  addresses?: string[];
  spentTxId: string;
  spentIndex: number;
  spentHeight: number;
};

// Rename to ATransaction
export type UnsignedTransaction<T> = {
  wallet: Wallet;
  privKey: string;
  address: string;
  amount: number; // coin amount in satoshi
  tamount?: number; // token amount
  fiat: {
    type: string;
    rate: number;
    amount: number;
    ethRate?: number;
  };
  feepipe: {
    type: WalletType;
    ticker: string;
    rate?: number;
    decimal: number;
    wallet?: Wallet;
  };
  gas?: GasTx;
  fee: FeeTx;
  nonce?: string;
  data?: any;
  mnemo?: string;
  utxo: any[];
  isMax: boolean;
  explorer?: Explorer;
  signature?: T;
  ready: boolean;
  keepAlive?: boolean;
};

// Rename to TransactionSignature
export type SignedTransaction = {
  amount: number;
  fee: number;
  rawtx?: string;
  utxo?: AddrUtxo[];
  change?: number;
  gasLimit?: number;
  gasPrice?: number;
};

export type SwapPair = {
  ExchangeEndpoint: string;
  SwapType: SwapType;
  SourceCurrency: string;
  SourceCurrencyNetwork: string;
  SourceDepositAddress: string;
  TargetCurrency: string;
  TargetCurrencyNetwork: string;
  IsEnabled: boolean;
};

export type SwapConvertResponse = {
  IsSourceCurrentAmountValid: boolean;
  SourceMinDepositAmount: number;
  SourceCurrentAmount: number;
  SourceMaxDepositAmount: number;
  TargetMinWithdrawalAmount: number;
  TargetEstimatedWithdrawalAmount: number;
  TargetGuaranteedPrice: number;
  TargetGuaranteedWithdrawalAmount: number;
  MinTradeAmount: number;
};

// export type SwapSingleResponse = {
//   sourceTxId: string;
//   sourceCurrency: string;
//   targetCurrency: string;
//   targetAddress: string;
//   refundAddress: string;
//   targetPrice: number;
//   referenceCode?: string;
//   userAgreedAmount: number;
//   sourceInitialAmount: number;
// };
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
  targetCurrency: string;
  targetCurrencyNetwork: string;
  targetExchangeEndpoint: ExchangeType;
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
  Pending = 25,
  Swapping = 50,
  Withdrawing = 75,
  Completed = 100,
}

export enum SwapStatusText {
  Pending = 'Pending',
  Swapping = 'Swapping',
  Withdrawing = 'Withdrawing',
  Completed = 'Completed',
}

export enum SwapType {
  Single = 'Single',
  Dex = 'Dex',
}

export interface SwapReportRequest {
  pageNumber: number;
  pageSize: number;
  swapStatus: SwapStatusText | SwapStatusText[];
}

export type SwapConvertRequestParams = {
  SourceAmount: number;
  SourceCurrency: string;
  SourceCurrencyNetwork: string;
  TargetCurrency: string;
  TargetCurrencyNetwork: string;
  TargetExchangeEndpoint: ExchangeType;
};

export type SwapRegisterWalletRequestParams = {
  currency: string;
  currencyNetwork: string;
  addresses: string[];
};

export type ExchangeType = string | 'ExchangeBinance' | 'ExchangeStex';

export interface SwapReportReuqestParams extends SwapReportRequest {
  swapType: SwapType;
}

enum OrderTypes {
  BUY = 'BUY',
  SELL = 'SELL',
}

export type SwapReportItem = {
  SagaId: string;
  UserId: string;
  OrderType: OrderTypes;
  CurrencyPairId: string;
  SourceInitialAmount: number;
  SourceCurrency: string;
  SourceRemainingAmount: number;
  SourceRefundAddress: string;
  SourceRefundAmount: number;
  SourceRefundTxId: string;
  TargetAddress: string;
  TargetPrice: number;
  TargetPurchasedAmount: number;
  TargetCurrency: string;
  TargetWithdrawalAmount: number;
  TargetWithdrawalTxId: string;
  UserAgreedAmount: number;
  StartedAt: string;
  UpdatedAt: string;
  Status: SwapStatusText;
  Cancelled: boolean;
  ReferenceCode?: string | null;
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

export type SwapConnectionReport = SwapReportItem[] | SwapReportItem;

export type ExplorerTransactionData = {
  from: number;
  to: number;
  totalItems: number;
  items: TransactionAPI[];
};

export interface Abi {
  contractaddress: string;
  type: WalletType;
  abi: string;
}

export interface SolFeeToken {
  ticker: string;
  type: WalletType;
}
