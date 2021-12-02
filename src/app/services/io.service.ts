import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Acc, AccLog } from 'src/app/interface/user';
import {
  Abi,
  AccountData,
  MasterSeed,
  Transaction,
  Wallet,
  WalletAddress,
  WalletType,
} from 'src/app/interface/data';
import { PlatformProvider } from 'src/app/providers/platform/platform';
import { DatabaseService } from './database/database.service';
import { AesService } from './aes.service';
import { LocalDatabaseService } from './database/local-database.service';
import { AuthenticationProvider } from 'src/app/providers/data/authentication.provider';
import { WalletsProvider } from '../providers/data/wallets.provider';
import { SimplioDatabase, DataLoaderObject } from '../interface/database';
import { compareValuesWith } from './utils.service';
import { fromPairs, sortBy } from 'lodash';
import { Settings } from '../interface/settings';
import { UserID, UUID } from '../interface/global';
import { CacheWallet } from '../interface/cache';
import { Tutorials } from 'src/app/interface/tutorials';
import { Storage } from '@capacitor/storage';

const BUFFER = 'cryptobuffer';
const LOGIN_KEY = 'coinguard-data';
const LOGIN_KEY_PASS = '0e49f971b4afee6c6b2aaa7bb3cad74545afd75f15716f674b9a59980d78a5c4';
export const REMEMBER_USER = 'rucr';

@Injectable({
  providedIn: 'root',
})
export class IoService {
  readonly accountEncryptedKeys = ['rtk', 'tkt', 'atk', 'idt'];
  readonly masterSeedEncryptedKeys = ['sed'];
  readonly walletEncryptedKeys = ['mnemo']; // @todo do we need `mainPrivKey`

  historyChange = new BehaviorSubject<any>(null);
  totalHistoryChange = new BehaviorSubject<any>(null);
  cacheChange = new BehaviorSubject<CacheWallet[]>(null);
  settingsChange = new BehaviorSubject<Settings>(null);
  isSaving = false;

  private userData: AccountData;
  simplioDatabase: SimplioDatabase;
  storage = Storage;

  constructor(
    private plt: PlatformProvider,
    private aesService: AesService,
    private databaseService: DatabaseService,
    private localDatabaseService: LocalDatabaseService,
    private authProvider: AuthenticationProvider, // remove deps
    private walletsProvider: WalletsProvider,
  ) {}

  /**
   *
   */
  async initDb(): Promise<boolean> {
    try {
      this.simplioDatabase = this.plt.isCordova ? this.databaseService : this.localDatabaseService;

      if (this.plt.isCordova) {
        await this.simplioDatabase.create();
      }

      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  /**
   *
   */
  loadData(): Promise<DataLoaderObject> {
    if (this.simplioDatabase) return this.simplioDatabase.fetchData();
    else throw new Error(`Database's not been initialized`);
  }

  clearUserData() {
    this.userData = undefined;
    this.walletsProvider.pushWallets([]);
    this.historyChange.next(null);
    this.simplioDatabase.wallets = [];
  }

  removeAll(account: string) {}

  unlockAccount(account: Acc, secret: string): Acc {
    return this._cryptStrict<Acc>({
      data: account,
      props: this.accountEncryptedKeys,
      secret,
    });
  }

  async updateAccount(acc: Acc, secret: string, alog = false): Promise<Acc> {
    try {
      const encrypted = this._cryptStrict<Acc>(
        {
          data: acc,
          props: this.accountEncryptedKeys,
          secret,
        },
        true,
      );

      await this.simplioDatabase.updateAccount(encrypted);

      if (alog) {
        await this.addAccountLog({
          idt: encrypted.idt,
          uid: encrypted.uid,
          lvl: acc.lvl,
        });
      }

      return acc;
    } catch (err) {
      throw err;
    }
  }

  async updateMasterSeed(msed: MasterSeed, secret: string): Promise<MasterSeed> {
    try {
      const encrypted = this._cryptStrict<MasterSeed>(
        {
          data: msed,
          props: this.masterSeedEncryptedKeys,
          secret,
        },
        true,
      );
      await this.simplioDatabase.updateMasterSeed(encrypted);
      return msed;
    } catch (err) {
      throw err;
    }
  }

  async addAccount(account: Acc): Promise<Acc> {
    // console.log('Adding account', account);
    try {
      const encrypted = this._crypt(
        {
          data: account,
          props: this.accountEncryptedKeys,
          secret: account.idt,
        },
        true,
      );
      const dbAccount = this.simplioDatabase.account;

      const a = !!dbAccount
        ? await this.simplioDatabase.updateAccount(compareValuesWith<Acc>(dbAccount, account))
        : await this.simplioDatabase.addAccount(encrypted);

      await this.addAccountLog({
        uid: a.uid,
        idt: a.idt,
        lvl: a.lvl,
      });

      return a;
    } catch (err) {
      throw err;
    }
  }

  addAccountLog(alog: AccLog): Promise<void> {
    return this.simplioDatabase.addAccountLog(alog);
  }

  getAccountLog(uid: UserID): Promise<AccLog[]> {
    return this.simplioDatabase.getAccountLog(uid);
  }

  getLatestAccountLog(uid: UserID): Promise<AccLog> {
    return this.simplioDatabase.getLatestAccountLog(uid);
  }

  addWallet(wallet: Wallet): Promise<Wallet> {
    return this.simplioDatabase.addWallet(wallet).then(() => wallet);
  }

  addAbi(abi: Abi): Promise<Abi> {
    return this.simplioDatabase.addAbi(abi).then(() => abi);
  }

  getAbi(contractAddress: string, type: WalletType): string {
    if (!contractAddress) {
      return '[]';
    }
    const abi = this.simplioDatabase.abis.find(
      e => e.contractaddress === contractAddress && e.type === type,
    )?.abi;
    try {
      return abi;
      // return [
      //   {
      //     "constant": false,
      //     "inputs": [
      //       {
      //         "name": "_to",
      //         "type": "address"
      //       },
      //       {
      //         "name": "_value",
      //         "type": "uint256"
      //       }
      //     ],
      //     "name": "transfer",
      //     "outputs": [],
      //     "payable": false,
      //     "stateMutability": "nonpayable",
      //     "type": "function"
      //   },
      //   {
      //     "constant": true,
      //     "inputs": [
      //       {
      //         "name": "who",
      //         "type": "address"
      //       }
      //     ],
      //     "name": "balanceOf",
      //     "outputs": [
      //       {
      //         "name": "",
      //         "type": "uint256"
      //       }
      //     ],
      //     "payable": false,
      //     "stateMutability": "view",
      //     "type": "function"
      //   }
      // ]
    } catch (_) {
      return '[]';
    }
  }

  async addMasterSeed(msed: MasterSeed, secret: string): Promise<MasterSeed> {
    try {
      const encrypted = this._cryptStrict(
        {
          data: msed,
          props: this.masterSeedEncryptedKeys,
          secret,
        },
        true,
      );
      await this.simplioDatabase.addMasterSeed(encrypted);
      return msed;
    } catch (err) {
      throw err;
    }
  }

  addWalletAddress(address: WalletAddress): Promise<Wallet> {
    return this.simplioDatabase.addWalletAddress(address).then(wa => {
      const wallets = this.matchWallets({ uid: this.authProvider.accountValue.uid });
      return wallets.find(w => w._uuid === wa._uuid);
    });
  }

  addTutorials(tutorials: Tutorials): Promise<Tutorials> {
    return this.simplioDatabase.addTutorials(tutorials);
  }

  updateWallet(wallet: Wallet): Promise<Wallet> {
    return this.simplioDatabase.updateWallet(wallet);
  }

  unlockWallets(wallets: Wallet[], secret: string): Wallet[] {
    return wallets.map(w =>
      this._cryptStrict<Wallet>({
        data: w,
        props: this.walletEncryptedKeys,
        secret,
      }),
    );
  }

  updateWallets(wallets: Wallet[], secret?: string): Promise<Wallet[]> {
    let walls = wallets;

    if (!!secret) {
      walls = walls.map(w =>
        this._cryptStrict<Wallet>(
          {
            data: w,
            props: this.walletEncryptedKeys,
            secret,
          },
          true,
        ),
      );
    }

    const updatePromises = walls.map(w => this.updateWallet(w));
    return Promise.all(updatePromises);
  }

  updateTutorials(tutorials: Tutorials): Promise<Tutorials> {
    return this.simplioDatabase.updateTutorials(tutorials);
  }

  alertTable(): Promise<void> {
    return this.simplioDatabase.alertTable();
  }

  // @todo finish this change
  updateAddressTx(name, address, txid) {
    const { uid } = this.authProvider.accountValue;
  }

  removeWallet(wallet: Wallet): Promise<Wallet[]> {
    return this.simplioDatabase.removeWallet(wallet);
  }

  removeWalletsOf(uid: UserID): Promise<void> {
    return this.simplioDatabase.removeWalletsOf(uid);
  }

  removeAccount(): Promise<void> {
    return this.simplioDatabase.removeAccount();
  }

  removeTutorials(uid: UserID): Promise<void> {
    return this.simplioDatabase.removeTutorials(uid);
  }

  updateSettings(id: UserID, settings: Settings): Promise<Settings> {
    return this.simplioDatabase
      .updateSettings(settings)
      .then(() => this.readSettings(id))
      .catch(err => {
        throw new Error(err);
      });
  }

  addSettings(settings: Settings): Promise<Settings> {
    return this.simplioDatabase.addSettings(settings);
  }

  readSettings(uid: UserID): Settings {
    try {
      return this.simplioDatabase.settings.find(s => s.uid === uid);
    } catch (err) {
      console.error(err);
      throw new Error('Reading setting has failed');
    }
  }

  getWallets(uid?: UserID) {
    const id = uid || this.authProvider.accountValue.uid;
    if (id.length > 0) {
      const wallets = this.simplioDatabase.wallets.filter(w => w.uid === id);
      this.walletsProvider.pushWallets(wallets);
      return wallets;
    } else {
      this.walletsProvider.pushWallets(this.simplioDatabase.wallets);
      return this.simplioDatabase.wallets;
    }
  }

  getAllWallets() {
    return this.simplioDatabase.wallets;
  }

  matchWallets(keyVal: Partial<Wallet>): Wallet[] {
    const isWallet = (w: Wallet) =>
      Object.entries(keyVal)
        .reduce((acc, curr) => {
          const [key, val] = curr;
          acc.push(w[key] === val);
          return acc;
        }, [])
        .every(v => !!v);
    return this.simplioDatabase.wallets.filter(isWallet);
  }

  getWallet(uuid: UUID): Wallet {
    return this.simplioDatabase.wallets.find(w => w._uuid === uuid);
  }

  getWalletByCoinType(ticker: string, type: WalletType, uid: UserID): Wallet {
    return this.simplioDatabase.wallets.find(
      w => w.ticker?.toLowerCase() === ticker.toLowerCase() && w.type === type && w.uid === uid,
    );
  }

  getWalletByCoin(ticker: string, uid: UserID): Wallet {
    return this.simplioDatabase.wallets.find(
      w => w.ticker?.toLowerCase() === ticker.toLowerCase() && w.uid === uid,
    );
  }

  async getMasterSeed(id: UserID, secret: string): Promise<MasterSeed> {
    const msed = await this.simplioDatabase.getMasterSeed(id);
    if (!msed) return null;

    return this._cryptStrict({
      data: msed,
      props: this.masterSeedEncryptedKeys,
      secret,
    });
  }

  getTutorials(uid: UserID): Promise<Tutorials> {
    return this.simplioDatabase.getTutorials(uid);
  }

  async addTransactionOf(wallet: Wallet, updateTransaction: boolean): Promise<Transaction[]> {
    if (!wallet.transactions || !wallet.transactions.length || !updateTransaction) {
      return Promise.resolve([]);
    }

    const dtxs = await this.getTransactionsOf(wallet);
    let newTxs = wallet.transactions.filter(e => dtxs.findIndex(ee => ee.hash === e.hash) === -1);
    newTxs = sortBy([...newTxs], 'unix');
    await Promise.all(newTxs.map(tx => this.simplioDatabase.addTransaction(tx)));

    let updatedTxs = wallet.transactions.filter(
      e =>
        dtxs.find(ee => ee.hash === e.hash) &&
        !dtxs.find(ee => ee.hash === e.hash && ee.confirmed === e.confirmed),
    );
    updatedTxs = sortBy([...updatedTxs], 'unix');
    await this.simplioDatabase.updateTransactions(updatedTxs);
  }

  removeTransactions(uuid: UUID): Promise<void> {
    return this.simplioDatabase.removeTransactions(uuid);
  }

  getTrasactionPageOf(wallet: Wallet, last = 1, limit = 15): Promise<Transaction[]> {
    return this.simplioDatabase.getWalletTransactionsPage(wallet._uuid, last, limit);
  }

  getTransactionsOf(wallet: Wallet): Promise<Transaction[]> {
    return this.simplioDatabase.getWalletTransactions(wallet._uuid);
  }

  // async setSwapCache(cache: SwapCache): Promise<SwapCache> {
  //   try {
  //     const { value } = await this.storage.get({ key: SWAP_CACHE });
  //     const exists = JSON.parse(value) || [];
  //     const c: SwapCache = exists ? { ...exists, ...cache } : { ...this._defaultSwapCache, ...cache };
  //     await this.storage.set({
  //       key: SWAP_CACHE,
  //       value: JSON.stringify(c)
  //     });
  //     return c;
  //   } catch (err) {
  //     throw new Error('Setting swap cache has failed');
  //   }
  // }

  // removeSwapCache(): Promise<void> {
  //   return this.storage.remove({ key: SWAP_CACHE });
  // }

  /**
   *
   * @param dep
   * @param encrypt
   * @private
   */
  private _crypt<T>(
    dep: {
      data: T;
      props: string[];
      secret: string;
    },
    encrypt: boolean = false,
  ): T {
    // assigning a proper crypting method
    const en = (s, p) => this.aesService.encryptString(s, p);
    const de = (s, p) => this.aesService.decryptString(s, p);
    const fn = encrypt ? en : de;

    const { data, props, secret } = dep;
    const dataCopy = Object.assign({}, data);
    // applying cryptic method to a selected values
    const crEntries = Object.entries(dataCopy).map(([key, value]) => {
      if (props.includes(key) && typeof value === 'string') {
        value = fn(value, secret);
      }
      return [key, value];
    });

    return fromPairs(crEntries) as T;
  }

  private _cryptStrict<T>(
    dep: {
      data: T;
      props: string[];
      secret: string;
    },
    encrypt: boolean = false,
  ): T {
    const _data = this._crypt<T>(dep, encrypt);

    Object.entries(_data)
      .filter(([k, _]) => dep.props.includes(k))
      .forEach(([, v]) => {
        if (v === '') throw new Error('Encryption has failed. Your value or secret is incorrect');
      });

    return _data;
  }

  decrypt(value: string, pass: string): string {
    return this.aesService.decryptString(value, pass);
  }

  encrypt(value: string, pass: string): string {
    return this.aesService.encryptString(value, pass);
  }
}
