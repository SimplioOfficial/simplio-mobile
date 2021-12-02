import { Injectable } from '@angular/core';

import { LocalStorage } from '../../providers/persistence/storage/local-storage';
import { Acc, AccLog } from '../../interface/user';
import { Wallet, MasterSeed, WalletAddress, Abi, Transaction } from '../../interface/data';
import { DatabaseStruct, DataLoaderKeys, DataLoaderObject } from '../../interface/database';
import { Settings } from '../../interface/settings';
import { UserID, UUID } from '../../interface/global';

import { isString, fromPairs, sortBy } from 'lodash';
import { AesService } from '../aes.service';
import { Tutorials } from 'src/app/interface/tutorials';
import { CacheWallet } from 'src/app/interface/cache';

const ACCS = 'accs'; // Accounts
const ALOG = 'alog'; // Accounts log
const SETT = 'sett'; // Settings
const MSED = 'msed'; // Master seed
const WCCH = 'wcch'; // Wallet Cache
const TCCH = 'tcch'; // Transaction cache
const TUTS = 'tuts'; // Tutorials
const ABIS = 'abis'; // Tutorials

const WALLETS = 'wallets';
const DATABASE_VERSION = 'dbv';

@Injectable({
  providedIn: 'root',
})
export class LocalDatabaseService implements DatabaseStruct {
  account: Acc = null;
  wallets: Wallet[] = [];
  settings: Settings[] = [];
  abis: Abi[] = [];
  cacheWallet: CacheWallet[] = [];

  constructor(private storage: LocalStorage, private aes: AesService) {}

  async create() {}

  fetchData(): Promise<DataLoaderObject> {
    return Promise.all([
      this.loadAccount('account'),
      this.loadWallets('wallets'),
      this.loadSettings('settings'),
      this.loadAbis('abis'),
      this.loadDatabaseVersion('databaseVersion'),
    ]).then(d => fromPairs(d) as DataLoaderObject);
  }

  loadWallets(key: DataLoaderKeys = 'wallets'): Promise<[DataLoaderKeys, Wallet[]]> {
    return this.storage.get(WALLETS).then(res => {
      if (res) {
        if (isString(res)) {
          res = JSON.parse(res);
        }
        this.wallets = res;
      }
      return [key, this.wallets];
    });
  }

  /**
   *
   */
  loadSettings(key: DataLoaderKeys = 'settings'): Promise<[DataLoaderKeys, Settings[]]> {
    return this.storage
      .get(SETT)
      .then(sett => (typeof sett === 'string' ? JSON.parse(sett) : sett))
      .then(sett => (Array.isArray(sett) ? sett : []))
      .then(sett => (this.settings = sett))
      .then(sett => [key, sett]);
  }

  /**
   *
   */
  loadAbis(key: DataLoaderKeys = 'abis'): Promise<[DataLoaderKeys, Abi[]]> {
    return this.storage.get(ABIS).then(abis => {
      if (abis) {
        if (isString(abis)) {
          abis = JSON.parse(abis);
        }
        this.abis = abis;
      }
      return [key, this.abis];
    });
  }

  loadAccount(key: DataLoaderKeys = 'account'): Promise<[DataLoaderKeys, Acc]> {
    return Promise.all<AccLog, Acc[]>([this._getLatestAccountLog(), this.getAllAccounts()])
      .then(([log, accs]) => accs.find(a => a?.uid === log?.uid && a?.idt === a?.idt))
      .then(acc => acc || null)
      .then(acc => (this.account = acc))
      .then(acc => [key, acc])
      .catch(() => null);
  }

  loadDatabaseVersion(key: DataLoaderKeys = 'databaseVersion'): Promise<[DataLoaderKeys, number]> {
    return (
      this.storage
        .get(DATABASE_VERSION)
        // if the database version does not exists create one with
        // a default value of 0.
        .then<number>(async v => {
          if (typeof v !== 'number') {
            const [_, v] = await this.storage
              .set(DATABASE_VERSION, 0)
              .then(() => this.loadDatabaseVersion(key));
            return v;
          } else return v;
        })
        .then<[DataLoaderKeys, number]>(v => [key, v])
        .catch(_ => [key, 0])
    );
  }

  addAccount(account: Acc): Promise<Acc> {
    const accounts = [account];
    return this.storage
      .set(ACCS, JSON.stringify(accounts))
      .then(() => (this.account = account))
      .then(() => account);
  }

  addMasterSeed(msed: MasterSeed): Promise<MasterSeed> {
    return this.getMasterSeeds()
      .then(m => [...m, msed])
      .then(m => this.storage.set(MSED, m))
      .then(_ => msed);
  }

  addWallet(wallet: Wallet): Promise<Wallet> {
    if (!this.wallets) {
      this.wallets = [];
    }
    this.wallets.push(wallet);
    return this.storage.set(WALLETS, JSON.stringify(this.wallets)).then(() => wallet);
  }

  addTutorials(tutorials: Tutorials): Promise<Tutorials> {
    return this._getArrayData<Tutorials>(TUTS)
      .then(tuts => [...tuts, tutorials])
      .then(tuts => this.storage.set(TUTS, tuts))
      .then(() => tutorials);
  }

  addAbi(abi: Abi): Promise<Abi> {
    if (!this.abis) {
      this.abis = [];
    }
    if (!this.abis.find(e => e.contractaddress === abi.contractaddress)) {
      this.abis.push(abi);
      return this.storage.set(ABIS, JSON.stringify(this.abis)).then(() => abi);
    } else {
      return Promise.resolve(abi);
    }
  }

  private _getArrayData<T>(table: string): Promise<T[]> {
    return this.storage
      .get(table)
      .then(his => (Array.isArray(his) ? his : []))
      .catch(err => {
        console.error('DB - getting data has failed', err);
        return [];
      });
  }

  async addAccountLog(alog: AccLog): Promise<void> {
    const log = await this.getAllAccountLog();
    return await this.storage.set(ALOG, [alog, ...log]);
  }

  getAccountLog(uid: UserID): Promise<AccLog[]> {
    return this.getAllAccountLog()
      .then(log => log.filter(l => l.uid === uid))
      .catch(() => []);
  }

  getAllAccountLog(): Promise<AccLog[]> {
    return this.storage
      .get(ALOG)
      .then<AccLog[]>(log => (typeof log === 'string' ? JSON.parse(log) : log))
      .then(log => (Array.isArray(log) ? log : []));
  }

  getLatestAccountLog(uid: UserID): Promise<AccLog> {
    return this.storage
      .get(ALOG)
      .then((alog: AccLog[]) => (Array.isArray(alog) ? alog : []))
      .then<AccLog>((alog: AccLog[]) => alog.find(l => l.uid === uid));
  }

  private _getLatestAccountLog(): Promise<AccLog> {
    return this.storage
      .get(ALOG)
      .then(log => log[0])
      .catch(() => null);
  }

  getAllAccounts(): Promise<Acc[]> {
    return this.storage
      .get(ACCS)
      .then<Acc[]>(accs => (typeof accs === 'string' ? JSON.parse(accs) : accs))
      .then<Acc[]>(accs => (Array.isArray(accs) ? accs : []));
  }

  getMasterSeeds(): Promise<MasterSeed[]> {
    return this.storage
      .get(MSED)
      .then<MasterSeed[]>(msed => (typeof msed === 'string' ? JSON.parse(msed) : msed))
      .then<MasterSeed[]>(msed => (Array.isArray(msed) ? msed : []))
      .catch(() => []);
  }

  getMasterSeed(uid: UserID): Promise<MasterSeed> {
    return this.getMasterSeeds().then<MasterSeed>(msed => msed.find(s => s.uid === uid));
  }

  getTutorials(uid: UserID): Promise<Tutorials> {
    return this._getArrayData<Tutorials>(TUTS).then(tuts => tuts.find(t => t.uid === uid));
  }

  updateAccount(account: Acc): Promise<Acc> {
    this.account = { ...this.account, ...account };
    return this.storage.set(ACCS, JSON.stringify([this.account])).then(() => this.account);
  }

  updateMasterSeed(msed: MasterSeed, isChange = false): Promise<MasterSeed> {
    return this.getMasterSeeds()
      .then(m =>
        m.map(s => {
          if (s.uid === msed.uid) {
            s = msed;
            isChange ? (s.bck = true) : (s.bck = msed.bck);
          }
          return s;
        }),
      )
      .then(m => this.storage.set(MSED, m))
      .then(_ => msed);
  }

  updateWallet(wallet: Wallet): Promise<Wallet> {
    this.wallets = this.wallets.map(w => (w._uuid === wallet._uuid ? wallet : w));
    return this.storage.set(WALLETS, JSON.stringify(this.wallets)).then(() => wallet);
  }

  updateTutorials(tutorials: Tutorials): Promise<Tutorials> {
    return this._getArrayData<Tutorials>(TUTS)
      .then(tuts => tuts.map(t => (t.uid === tutorials.uid ? tutorials : t)))
      .then(tuts => this.storage.set(TUTS, tuts))
      .then(() => tutorials);
  }

  alertTable(): Promise<void> {
    return new Promise<void>(resolve => {
      // do nothing
      resolve();
    });
  }

  updateSettings(settings: Settings) {
    this.settings = this.settings.map(s => (s.uid === settings.uid ? settings : s));
    this.settings = this.settings.map(s => (s.uid === settings.uid ? settings : s));
    return this.storage.set(SETT, JSON.stringify(this.settings));
  }

  addSettings(settings: Settings): Promise<Settings> {
    this.settings.push(settings);
    return this.storage.set(SETT, JSON.stringify(this.settings)).then(() => settings);
  }

  removeWallet(wallet: Wallet): Promise<Wallet[]> {
    this.wallets = this.wallets.filter(w => w._uuid !== wallet._uuid);
    return this.storage.set(WALLETS, JSON.stringify(this.wallets)).then(() => this.wallets);
  }

  removeWalletsOf(uid: UserID): Promise<void> {
    this.wallets = this.wallets?.filter(w => w.uid !== uid);

    return Promise.all([this.storage.set(WALLETS, JSON.stringify(this.wallets))])
      .then(() => this.loadWallets())
      .then(() => {})
      .catch(err => {
        console.error(`DB - removing wallets of ${uid} has failed`, err);
        throw err;
      });
  }

  removeAccount(): Promise<void> {
    return this.storage.set(ACCS, []).then(() => (this.account = null));
  }

  removeTutorials(uid: UserID): Promise<void> {
    return this._getArrayData<Tutorials>(TUTS)
      .then(tuts => tuts.filter(t => t.uid !== uid))
      .then(tuts => this.storage.set(TUTS, tuts));
  }

  addWalletAddress(address: WalletAddress): Promise<WalletAddress> {
    const i = this.wallets.findIndex(w => w._uuid === address._uuid);
    if (i > -1) {
      this.wallets[i].addresses.push(address);
      this.wallets[i].mainAddress = address.address;
    }
    return this.storage.set(WALLETS, JSON.stringify(this.wallets)).then(() => address);
  }

  clearAllData() {
    // this.storage.set(ACCOUNTS, "");
    // this.storage.set(CACHE, "");
    this.storage.set(SETT, '');
    // this.storage.set(WALLETS, "");
  }

  // setDatabaseVersion(version?: number): Promise<number> {
  //   const currentVerions = version ?? this.databaseVerison ?? 0;
  //   const updatedVerison = currentVerions + 1;
  //   return this.storage.set(DATABASE_VERSION, updatedVerison).then(() => {
  //     this.databaseVerison = updatedVerison;
  //     return updatedVerison;
  //   });
  // }

  // // get region
  // getAccount(email: string): Promise<{ data: Acc | null; error: boolean }> {
  //   return this.storage.get(ACCOUNTS).then(res => {
  //     let accounts;
  //     if (isString(res)) {
  //       accounts = JSON.parse(res);
  //     } else {
  //       accounts = res;
  //     }
  //     const datartn = {
  //       data: null,
  //       error: false
  //     };
  //     if (accounts) {
  //       const idx = accounts.findIndex(e => e.email === email);
  //       if (idx > -1) {
  //         datartn.error = false;
  //         datartn.data = accounts[idx];
  //       } else {
  //         datartn.error = true;
  //       }
  //     } else {
  //       datartn.error = true;
  //     }
  //     return datartn;
  //   });
  // }

  // /**
  //  *  Retrieve a primary password with master password
  //  *  @param email
  //  *  @param pass
  //  */
  // async forgotPass(email: string, passwordMaster: string): Promise<string> {
  //   const errorMsg = new Error('Account is not existed');
  //   try {
  //     const { error, data } = await this.getAccount(email);
  //     if (error) throw errorMsg;

  //     if (data && 'recover' in data) {
  //       const password = this.aes.decryptString(data.recover, passwordMaster);
  //       return password;
  //     }

  //     throw errorMsg;
  //   } catch (err) {
  //     throw new Error(err);
  //   }
  // }

  async addTransaction(tx: Transaction): Promise<Transaction> {
    const dtxs = (await this.storage.get(TCCH)) || [];
    return this.storage.set(TCCH, sortBy([...dtxs, tx], 'unix').slice(0, 20)).then(() => tx);
  }

  async updateTransactions(txs: Transaction[]) {
    let dtxs = (await this.storage.get(TCCH)) || [];
    dtxs = dtxs.filter(e => !txs.find(ee => ee.hash === e.hash));
    return this.storage.set(TCCH, sortBy([...dtxs, ...txs], 'unix').slice(0, 20)).then(() => txs);
  }

  async removeTransactions(uuid: UUID): Promise<void> {
    const dtxs: Transaction[] = (await this.storage.get(TCCH)) || [];
    const txs = dtxs.filter(t => t._uuid !== uuid);
    return this.storage.set(TCCH, txs);
  }

  async getWalletTransactionsPage(uuid: UUID, last: number, limit = 15) {
    return [];
  }

  async getWalletTransactions(uuid: UUID) {
    const cache = this.wallets.find(e => e._uuid === uuid);
    return cache ? cache.transactions : [];
  }
}
