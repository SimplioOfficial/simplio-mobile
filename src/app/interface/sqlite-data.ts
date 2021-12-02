import { UserID } from 'src/app/interface/global';
import { Acc, AccLog } from 'src/app/interface/user';
import { WalletType } from './data';

interface DataRows<T> {
  length: number;
  item(i: number): T;
}
export type DataResponse<T> = {
  insertId: any;
  rowsAffected: number;
  rows: DataRows<T>;
};

export type AccountSqlData = Acc & {
  id: number;
};
export type AccLogSqlData = AccLog;
export type MasterSeedSqlData = {
  uid: string;
  sed: string;
  bck: number;
};

export type SettingsSqlData = {
  uid: string;
  refresh: number;
  language: string;
  currency: string;
  feePolicy: string;
  primaryWallet: string;
  graph_enable: number;
  graph_period: string;
  theme_mode: number;
  theme_accent: string;
};

export type AbisSqlData = {
  contractaddress: string;
  wallet_type: WalletType;
  abi: string;
};

export type WalletSqlData = {
  _p: number;
  _uuid: string;
  uid: string;
  wallet_name: string;
  wallet_type: number;
  ticker: string;
  balance: number;
  unconfirmed: number;
  mnemo: string;
  main_address: string;
  token_address: string;
  is_active: number; // bool
  is_rescanning: number;
  last_tx: string;
  last_block: number;
  wallet_decimal: number;
  contract_address: string;
  apiurl: string;
  origin: string;
  unique_id: number;
  is_initialized: number;
};

export type WallletAddressSqlData = {
  _uuid: string;
  derive_path: string;
  addr: string;
  balance: number;
};

export interface CacheWalletSqlData {
  _uuid: string;
  uid: string;
  balance: number;
  unconfirmed: number;
  lasttx: string;
  lastblock: number;
}

export interface TransactionSqlData {
  id?: number;
  _uuid: string;
  addr: string;
  txtype: number;
  ticker: string;
  amount: number;
  txhash: string;
  unix: number;
  txdate: string;
  confirmed: number; // bool
  blockconfirmed: number;
}

export interface DatabaseVersionSqlData {
  id?: number;
  ver: number;
}

export interface HistoryItemSqlData {
  id?: number;
  uid: string;
  balance: number;
  unix: number;
}

export interface WalletHistoryItemSqlData extends HistoryItemSqlData {
  _uuid: string;
}

export interface TutorialsSqlData {
  uid: UserID;
  tut_init: number; // bool
}
