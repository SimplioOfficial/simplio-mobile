import { Transaction } from './data';
import { UserID, UUID } from './global';

export interface CacheData {
  cache: CacheWallet[];
}

export interface CacheWallet {
  _uuid: UUID; // wallets cache
  uid: UserID;
  balance: number;
  unconfirmed: number;
  lasttx: string;
  lastblock: number;
  // name: string;
}
