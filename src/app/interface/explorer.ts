export interface Networks {
  [ticker: string]: Explorer;
}

export interface NetworkFallback {
  [ticker: string]: [Explorer];
}

export interface Explorer {
  url: string;
  api: string;
  type?: ExplorerType;
  api_key?: string;
  api_transaction?: string;
  api_transaction2?: string;
  api_balance?: string;
  abi?: string;
  priority?: number;
}

export enum ExplorerType {
  INSIGHT = 0,
  BLOCKBOOK, // default is v2
  UNKNOWN = 999,
}

export interface BlockbookAddress {
  address: string;
  balance: string;
  totalReceived: string;
  totalSent: string;
  unconfirmedBalance: string;
  unconfirmedTxs: string;
}

export interface BlockbookUtxo {
  txid: string;
  vout: number;
  value: string;
  confirmations: number;
  lockTime: number;
  address?: string;
}
