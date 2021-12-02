import { MasterSeed, WalletAddress, Wallet, Abi, Transaction } from './data';
import { Acc, AccLog } from './user';
import { Settings } from './settings';
import { UserID, UUID } from './global';
import { Tutorials } from 'src/app/interface/tutorials';
import { CacheWallet } from 'src/app/interface/cache';

export interface BitfrostDatabase {
  account: Acc;
  wallets: Wallet[];
  settings: Settings[];
  abis: Abi[];
  cacheWallet: CacheWallet[];

  create(): Promise<void>;

  fetchData();
  // forgotPass(email, recover);

  addAccount(account: Acc): Promise<Acc>;
  addAccountLog(alog: AccLog): Promise<void>;
  addMasterSeed(msed: MasterSeed): Promise<MasterSeed>;
  addWallet(wallet: Wallet): Promise<Wallet>;
  addSettings(settings: Settings): Promise<Settings>;
  addWalletAddress(address: WalletAddress): Promise<WalletAddress>;
  addTransaction(tx: Transaction): Promise<Transaction>;
  addTutorials(tutorials: Tutorials): Promise<Tutorials>;
  addAbi(abi: Abi): Promise<Abi>;

  getAccountLog(uid: UserID): Promise<AccLog[]>;
  getLatestAccountLog(uid: UserID): Promise<AccLog>;
  getMasterSeed(uid: UserID): Promise<MasterSeed>;
  getTutorials(uid: UserID): Promise<Tutorials>;
  getWalletTransactionsPage(uuid: UUID, last: number, limit: number): Promise<Transaction[]>;
  getWalletTransactions(uuid: UUID): Promise<Transaction[]>;

  updateAccount(account: Acc): Promise<Acc>;
  updateMasterSeed(msed: MasterSeed): Promise<MasterSeed>;
  updateTransactions(txs: Transaction[]);

  alertTable();

  updateWallet(wallet: Wallet): Promise<Wallet>;
  updateSettings(settings: Settings);
  updateTutorials(tutorial: Tutorials): Promise<Tutorials>;

  removeWallet(wallet: Wallet): Promise<Wallet[]>;
  removeWalletsOf(idt: UserID): Promise<void>;
  removeAccount(): Promise<void>;
  removeTutorials(uid: UserID): Promise<void>;
  removeTransactions(uuid: UUID): Promise<void>;

  wipeAccount?(uid: UserID): Promise<void>;
}

export type DataLoaderKeys = 'wallets' | 'settings' | 'account' | 'databaseVersion' | 'abis';

type DataLoader<T, K> = (key: T) => Promise<[T, K]>;
export type DataLoaderObject = { [key in DataLoaderKeys]: any };

export interface DatabaseStruct extends BitfrostDatabase {
  loadAccount: DataLoader<DataLoaderKeys, Acc>;
  loadWallets: DataLoader<DataLoaderKeys, Wallet[]>;
  loadSettings: DataLoader<DataLoaderKeys, Settings[]>;
  loadDatabaseVersion: DataLoader<DataLoaderKeys, number>;
}
