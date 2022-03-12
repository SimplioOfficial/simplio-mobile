import { Injectable } from '@angular/core';
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { HttpClient } from '@angular/common/http';
import { fromPairs } from 'lodash';
import { CacheWallet } from 'src/app/interface/cache';
import {
  Wallet,
  MasterSeed,
  Transaction,
  FeeName,
  WalletAddress,
  Abi,
} from 'src/app/interface/data';
import { DatabaseStruct, DataLoaderObject, DataLoaderKeys } from 'src/app/interface/database';
import { UserID, UUID } from 'src/app/interface/global';
import { Acc, AccLog } from 'src/app/interface/user';
import { AccentColor, Settings } from 'src/app/interface/settings';
import {
  AccLogSqlData,
  AccountSqlData,
  TransactionSqlData,
  DatabaseVersionSqlData,
  SettingsSqlData,
  WalletSqlData,
  WallletAddressSqlData,
  TutorialsSqlData,
  MasterSeedSqlData,
  AbisSqlData,
} from 'src/app/interface/sqlite-data';
import {
  getItem,
  filterWalletAddresses,
  toBool,
  getData,
  fromBool,
} from 'src/app/services/database/utils';
import { AesService } from '../aes.service';
import { Tutorials } from 'src/app/interface/tutorials';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService implements DatabaseStruct {
  private database: SQLiteObject;
  account: Acc = null;
  wallets: Wallet[] = [];
  settings: Settings[] = [];
  msed: MasterSeed;
  abis: Abi[] = [];
  cacheWallet: CacheWallet[] = [];

  constructor(
    private sqlitePorter: SQLitePorter,
    private sqlite: SQLite,
    private http: HttpClient,
    private aes: AesService,
  ) {}

  async create() {
    this.database = await this.sqlite.create({
      name: 'data.db',
      location: 'default',
    });

    await this.seedDatabase();
    await this.updateDatabase();
  }

  seedDatabase(): Promise<void> {
    return this.http
      .get('assets/seed.sql', { responseType: 'text' })
      .toPromise()
      .then(sql => this.sqlitePorter.importSqlToDb(this.database, sql));
  }

  fetchData(): Promise<DataLoaderObject> {
    return Promise.all([
      this.loadAccount('account'),
      this.loadWallets('wallets'),
      this.loadSettings('settings'),
      this.loadAbis('abis'),
      this.loadDatabaseVersion('databaseVersion'),
    ]).then(d => fromPairs(d) as DataLoaderObject);
  }

  loadAccount(key: DataLoaderKeys = 'account'): Promise<[DataLoaderKeys, Acc]> {
    const sqlStatement = `SELECT * FROM accs ORDER BY ID DESC LIMIT 1`;

    return this.database
      .executeSql(sqlStatement, [])
      .then(d => getItem<AccountSqlData>(d, 0))
      .then(a => (this.account = a))
      .then(a => [key, a]);
  }

  private async _loadWallet(w: WalletSqlData, addresses: WallletAddressSqlData[]): Promise<Wallet> {
    const addrs = filterWalletAddresses(w._uuid, addresses);
    return {
      _p: w._p,
      _uuid: w._uuid,
      uid: w.uid,
      name: w.wallet_name,
      type: w.wallet_type,
      ticker: w.ticker,
      balance: w.balance,
      unconfirmed: w.unconfirmed,
      mnemo: w.mnemo,
      mainAddress: w.main_address,
      tokenAddress: w.token_address,
      isActive: toBool(w.is_active),
      isRescanning: toBool(w.is_rescanning),
      lastblock: w.last_block,
      lasttx: w.last_tx,
      decimal: w.wallet_decimal,
      contractaddress: w.contract_address,
      addresses: addrs,
      origin: w.origin,
      uniqueId: w.unique_id,
      isInitialized: toBool(w.is_initialized),
      transactions: await this._getTransactions(w._uuid),
      addressType: w.address_type,
      api: w.apiurl,
    };
  }

  loadWallets(key: DataLoaderKeys = 'wallets'): Promise<[DataLoaderKeys, Wallet[]]> {
    return Promise.all([this._getWallets(), this._getAddresses()])
      .then<Wallet[]>(([wallets, addresses]) => {
        var promisesToMake = [];
        wallets.map(w => {
          promisesToMake.push(this._loadWallet(w, addresses));
        });
        return Promise.all(promisesToMake);
      })
      .then(w => (this.wallets = w))
      .then(() => [key, this.wallets]);
  }

  loadSettings(key: DataLoaderKeys = 'settings'): Promise<[DataLoaderKeys, Settings[]]> {
    return this.database
      .executeSql('SELECT * FROM setts', [])
      .then(d => getData<SettingsSqlData>(d))
      .then(sett =>
        sett.map<Settings>(s => ({
          uid: s.uid,
          refresh: s.refresh,
          language: s.language,
          currency: s.currency,
          feePolicy: s.feePolicy as FeeName,
          primaryWallet: s.primaryWallet,
          graph: {
            enableGraph: toBool(s.graph_enable),
            period: s.graph_period,
          },
          theme: {
            accent: s.theme_accent as AccentColor,
            mode: s.theme_mode,
          },
        })),
      )
      .then(sett => (this.settings = sett))
      .then(sett => [key, sett]);
  }

  loadAbis(key: DataLoaderKeys = 'abis'): Promise<[DataLoaderKeys, Abi[]]> {
    return this.database
      .executeSql('SELECT * FROM abis', [])
      .then(d => getData<AbisSqlData>(d))
      .then(abii =>
        abii.map<Abi>(a => ({
          contractaddress: a.contractaddress,
          abi: a.abi,
          type: a.wallet_type,
        })),
      )
      .then(abii => (this.abis = abii))
      .then(abii => [key, abii]);
  }

  private _getAddresses(): Promise<WallletAddressSqlData[]> {
    return this.database
      .executeSql('SELECT * FROM addrs', [])
      .then(d => getData<WallletAddressSqlData>(d))
      .catch(err => {
        console.error('DB - loading all addresses has failed', err);
        throw err;
      });
  }

  private _getWallets(): Promise<WalletSqlData[]> {
    return this.database
      .executeSql('SELECT * FROM walls', [])
      .then(d => getData<WalletSqlData>(d))
      .catch(err => {
        console.error('DB - loading all wallets has failed', err);
        throw err;
      });
  }

  private _getTransactions(uuid: UUID): Promise<Transaction[]> {
    const sqlStatement = `SELECT * FROM tcch WHERE (_uuid = ?) ORDER BY unix DESC LIMIT 20`;
    return this.database
      .executeSql(sqlStatement, [])
      .then(d => getData<Transaction>(d))
      .catch(err => {
        console.error('DB - loading wallets transactions has failed', err);
        throw err;
      });
  }

  loadDatabaseVersion(key: DataLoaderKeys = 'databaseVersion'): Promise<[DataLoaderKeys, number]> {
    return this.database
      .executeSql('SELECT * FROM dbv ORDER BY ID DESC LIMIT 1', [])
      .then(d => getItem<DatabaseVersionSqlData>(d, 0))
      .then(({ ver }) => [key, ver])
      .catch(_ => null)
      .then(_ => [key, 0]);
  }

  addAccount(account: Acc): Promise<Acc> {
    const data = Object.values(account);
    const sqlKeys = Object.keys(account);
    const sqlKeyValues = Array.from(sqlKeys, () => '?');
    const sqlStatement = `INSERT INTO accs (${sqlKeys.join(', ')}) VALUES (${sqlKeyValues})`;

    return this.database
      .executeSql(sqlStatement, data)
      .then(() => account)
      .catch(err => {
        console.error('DB - adding account has failed', err);
        throw err;
      });
  }

  addAccountLog(alog: AccLog): Promise<void> {
    const data = Object.values(alog);
    const sqlKeys = Object.keys(alog);
    const sqlKeyValues = Array.from(sqlKeys, () => '?');
    const sqlStatement = `INSERT INTO alog (${sqlKeys.join(', ')}) VALUES (${sqlKeyValues})`;

    return this.database.executeSql(sqlStatement, data).catch(err => {
      console.error('DB - adding account log has failed', err);
      throw err;
    });
  }

  addMasterSeed(msed: MasterSeed): Promise<MasterSeed> {
    const data: MasterSeedSqlData = {
      bck: fromBool(msed.bck),
      sed: msed.sed,
      uid: msed.uid,
    };
    const sqlKeys = Object.keys(data);
    const sqlValues = Object.values(data);
    const sqlKeyValues = Array.from(sqlKeys, () => '?');
    const sqlStatement = `INSERT INTO msed (${sqlKeys.join(', ')}) VALUES (${sqlKeyValues})`;

    return this.database
      .executeSql(sqlStatement, sqlValues)
      .then(() => msed)
      .catch(err => {
        console.error('DB - adding master seed has failed', err);
        throw err;
      });
  }

  addWallet(wallet: Wallet): Promise<Wallet> {
    const data: WalletSqlData = {
      _p: wallet._p,
      _uuid: wallet._uuid,
      uid: wallet.uid,
      wallet_name: wallet.name,
      wallet_type: wallet.type,
      ticker: wallet.ticker,
      balance: wallet.balance,
      unconfirmed: wallet.unconfirmed,
      mnemo: wallet.mnemo,
      main_address: wallet.mainAddress,
      token_address: wallet.tokenAddress,
      is_active: fromBool(wallet.isActive),
      is_rescanning: fromBool(wallet.isRescanning),
      last_block: wallet.lastblock,
      last_tx: wallet.lasttx,
      wallet_decimal: wallet.decimal,
      contract_address: wallet.contractaddress,
      apiurl: wallet.api,
      origin: wallet.origin,
      unique_id: wallet.uniqueId,
      is_initialized: fromBool(wallet.isInitialized),
      address_type: wallet.addressType,
    };
    const sqlKeys = Object.keys(data);
    const sqlValues = Object.values(data);
    const sqlKeyValues = Array.from(sqlKeys, () => '?').join(', ');
    const sqlStatement = `INSERT INTO walls (${sqlKeys}) VALUES (${sqlKeyValues})`;

    const addresses = wallet.addresses;
    const addrsProm = addresses.map(a => this.addWalletAddress(a));

    return Promise.all([this.database.executeSql(sqlStatement, sqlValues), ...addrsProm])
      .then(() => this.wallets.push(wallet))
      .then(() => wallet)
      .catch(err => {
        console.error('DB - adding a wallet has failed', err);
        throw err;
      });
  }

  addTutorials(tutorials: Tutorials): Promise<Tutorials> {
    const data: TutorialsSqlData = {
      uid: tutorials.uid,
      tut_init: fromBool(tutorials.tutInit),
    };
    const sqlKeys = Object.keys(data);
    const sqlValues = Object.values(data);
    const sqlKeyValues = Array.from(sqlKeys, () => '?').join(', ');
    const sqlStatement = `INSERT INTO tuts (${sqlKeys}) VALUES (${sqlKeyValues})`;

    return this.database
      .executeSql(sqlStatement, sqlValues)
      .then(() => tutorials)
      .catch(err => {
        console.error('DB - adding tutorial has failed', err);
        throw err;
      });
  }

  addAbi(abi: Abi): Promise<Abi> {
    const data: AbisSqlData = {
      contractaddress: abi.contractaddress,
      abi: abi.abi,
      wallet_type: abi.type,
    };
    if (!this.abis.find(e => e.contractaddress === abi.contractaddress)) {
      const sqlKeys = Object.keys(data);
      const sqlValues = Object.values(data);
      const sqlKeyValues = Array.from(sqlKeys, () => '?').join(', ');
      const sqlStatement = `INSERT INTO abis (${sqlKeys}) VALUES (${sqlKeyValues})`;

      return Promise.all([this.database.executeSql(sqlStatement, sqlValues)])
        .then(() => this.abis.push(abi))
        .then(() => abi)
        .catch(err => {
          console.error('DB - adding a abi has failed', err);
          throw err;
        });
    } else {
      return Promise.resolve(abi);
    }
  }

  addWalletAddress(address: WalletAddress): Promise<WalletAddress> {
    const data: WallletAddressSqlData = {
      _uuid: address._uuid,
      addr: address.address,
      balance: address.balance,
      derive_path: address.derivePath,
    };
    const sqlKeys = Object.keys(data);
    const sqlValues = Object.values(data);
    const sqlKeyValues = Array.from(sqlKeys, () => '?').join(', ');

    const sqlStatement = `INSERT INTO addrs (${sqlKeys}) VALUES (${sqlKeyValues})`;

    return this.database
      .executeSql(sqlStatement, sqlValues)
      .then(() => address)
      .catch(err => {
        console.error('DB - adding an address has failed', err);
        throw err;
      });
  }

  addSettings(settings: Settings): Promise<Settings> {
    const data: SettingsSqlData = {
      uid: settings.uid,
      refresh: settings.refresh,
      language: settings.language,
      currency: settings.currency,
      feePolicy: settings.feePolicy,
      primaryWallet: settings.primaryWallet,
      graph_enable: fromBool(settings.graph.enableGraph),
      graph_period: settings.graph.period,
      theme_mode: settings.theme.mode,
      theme_accent: settings.theme.accent,
    };
    const sqlKeys = Object.keys(data);
    const sqlValues = Object.values(data);
    const sqlKeyValues = Array.from(sqlKeys, () => '?').join(', ');

    const sqlStatement = `INSERT INTO setts (${sqlKeys}) VALUES (${sqlKeyValues})`;

    return this.database
      .executeSql(sqlStatement, sqlValues)
      .then(() => this.settings.push(settings))
      .then(() => settings)
      .catch(err => {
        console.error('DB - adding settings has failed', err);
        throw err;
      });
  }

  getAccountLog(uid: UserID): Promise<AccLog[]> {
    const sqlStatement = `SELECT * FROM alog WHERE (uid = ?) ORDER BY ID DESC`;

    return this.database
      .executeSql(sqlStatement, [uid])
      .then(d => getData<AccLogSqlData>(d))
      .catch(err => {
        console.error('DB - getting account log has failed', err);
        throw err;
      });
  }

  getLatestAccountLog(uid: UserID): Promise<AccLog> {
    const sqlStatement = `SELECT * FROM alog WHERE (uid = ?) ORDER BY ID DESC LIMIT 1`;

    return this.database
      .executeSql(sqlStatement, [uid])
      .then(d => getItem<AccLogSqlData>(d, 0))
      .catch(err => {
        console.error('DB - getting the latest account log has failed', err);
        throw err;
      });
  }

  getMasterSeed(uid: UserID): Promise<MasterSeed> {
    const sqlStatement = `SELECT * FROM msed WHERE (uid = ?) ORDER BY ID DESC LIMIT 1`;

    return this.database
      .executeSql(sqlStatement, [uid])
      .then(d => getItem<MasterSeedSqlData>(d, 0))
      .then(d =>
        !!d
          ? {
              uid: d.uid,
              sed: d.sed,
              bck: toBool(d.bck),
            }
          : null,
      )
      .catch(err => {
        console.error('DB - getting master seed has failed', err);
        throw err;
      });
  }

  getTutorials(uid: UserID): Promise<Tutorials> {
    const sqlStatement = `SELECT * FROM tuts WHERE (uid = ?) ORDER BY ID DESC LIMIT 1`;

    return this.database
      .executeSql(sqlStatement, [uid])
      .then(d => getItem<TutorialsSqlData>(d, 0))
      .then(tut =>
        !!tut
          ? {
              uid: tut.uid,
              tutInit: toBool(tut.tut_init),
            }
          : null,
      )
      .catch(err => {
        console.error(`DB - getting tutorials of ${uid} has failed`, err);
        throw err;
      });
  }

  // TODO - change the
  updateAccount(account: Acc): Promise<Acc> {
    const acc: Omit<AccountSqlData, 'uid' | 'id'> = {
      email: account.email,
      rtk: account.rtk,
      idt: account.idt,
      lvl: account.lvl,
      atk: account.atk,
      tkt: account.tkt,
    };
    const sqlKeys = Object.keys(acc);
    const sqlValues = Object.values(acc);
    const sqlKeyValues = Array.from(sqlKeys, k => `${k} = ?`).join(', ');
    const sqlWhere = Array.from(['uid'], k => `${k} = ?`).join(' AND ');

    const sqlStatement = `UPDATE accs SET ${sqlKeyValues} WHERE ${sqlWhere}`;

    return this.database
      .executeSql(sqlStatement, [...sqlValues, account.uid])
      .then(() => account)
      .catch(err => {
        console.error('DB - updating account has failed', err);
        throw err;
      });
  }

  updateSettings(settings: Settings): Promise<Settings> {
    const data: Omit<SettingsSqlData, 'uid'> = {
      currency: settings.currency,
      feePolicy: settings.feePolicy,
      graph_enable: fromBool(settings.graph.enableGraph),
      graph_period: settings.graph.period,
      language: settings.language,
      primaryWallet: settings.primaryWallet,
      refresh: settings.refresh,
      theme_accent: settings.theme.accent,
      theme_mode: settings.theme.mode,
    };
    const sqlKeys = Object.keys(data);
    const sqlValues = Object.values(data);
    const sqlKeyValues = Array.from(sqlKeys, k => `${k} = ?`).join(', ');
    const sqlWhere = Array.from(['uid'], k => `${k} = ?`).join(' AND ');
    const sqlStatement = `UPDATE setts SET ${sqlKeyValues} WHERE ${sqlWhere}`;

    return this.database
      .executeSql(sqlStatement, [...sqlValues, settings.uid])
      .then(_ => this.settings.map(s => (s.uid === settings.uid ? settings : s)))
      .then(s => (this.settings = s))
      .then(_ => settings)
      .catch(err => {
        console.error('DB - adding settings has failed', err);
        throw err;
      });
  }

  updateWallet(wallet: Wallet): Promise<Wallet> {
    const data: Omit<WalletSqlData, '_uuid'> = {
      _p: wallet._p,
      balance: wallet.balance,
      ticker: wallet.ticker,
      is_active: fromBool(wallet.isActive),
      is_rescanning: fromBool(wallet.isRescanning),
      main_address: wallet.mainAddress,
      token_address: wallet.tokenAddress,
      mnemo: wallet.mnemo,
      uid: wallet.uid,
      unconfirmed: wallet.unconfirmed,
      wallet_name: wallet.name,
      wallet_type: wallet.type,
      last_block: wallet.lastblock,
      last_tx: wallet.lasttx,
      wallet_decimal: wallet.decimal,
      contract_address: wallet.contractaddress,
      apiurl: wallet.api,
      origin: wallet.origin,
      unique_id: wallet.uniqueId,
      is_initialized: fromBool(wallet.isInitialized),
      address_type: wallet.addressType,
    };
    const sqlKeys = Object.keys(data);
    const sqlValues = Object.values(data);
    const sqlKeyValues = Array.from(sqlKeys, k => `${k} = ?`).join(', ');
    const sqlWhere = Array.from(['_uuid'], k => `${k} = ?`).join(' AND ');
    const sqlStatement = `UPDATE walls SET ${sqlKeyValues} WHERE ${sqlWhere}`;

    const idx = this.wallets.findIndex(e => e._uuid === wallet._uuid);
    if (idx < 0) return Promise.reject(new Error('Wallet was not found'));

    return this.database
      .executeSql(sqlStatement, [...sqlValues, wallet._uuid])
      .then(_ => this.wallets.map(w => (w._uuid === wallet._uuid ? wallet : w)))
      .then(w => (this.wallets = w))
      .then(_ => wallet)
      .catch(err => {
        console.error('DB - adding a wallet has failed', err);
        throw err;
      });
  }

  updateMasterSeed(msed: MasterSeed): Promise<MasterSeed> {
    const data: Omit<MasterSeedSqlData, 'uid'> = {
      sed: msed.sed,
      bck: fromBool(msed.bck),
    };
    const sqlKeys = Object.keys(data);
    const sqlValues = Object.values(data);
    const sqlKeyValues = Array.from(sqlKeys, k => `${k} = ?`).join(', ');
    const sqlWhere = Array.from(['uid'], k => `${k} = ?`).join(' AND ');
    const sqlStatement = `UPDATE msed SET ${sqlKeyValues} WHERE ${sqlWhere}`;

    return this.database
      .executeSql(sqlStatement, [...sqlValues, msed.uid])
      .then(() => msed)
      .catch(err => {
        console.error('DB - adding a master seed has failed', err);
        throw err;
      });
  }

  updateTutorials(tutorials: Tutorials): Promise<Tutorials> {
    const data: Omit<TutorialsSqlData, 'uid'> = {
      tut_init: fromBool(tutorials.tutInit),
    };
    const sqlKeys = Object.keys(data);
    const sqlValues = Object.values(data);
    const sqlKeyValues = Array.from(sqlKeys, k => `${k} = ?`).join(', ');
    const sqlWhere = Array.from(['uid'], k => `${k} = ?`).join(' AND ');
    const sqlStatement = `UPDATE tuts SET ${sqlKeyValues} WHERE ${sqlWhere}`;

    return this.database
      .executeSql(sqlStatement, [...sqlValues, tutorials.uid])
      .then(() => tutorials)
      .catch(err => {
        console.error('DB - adding a master seed has failed', err);
        throw err;
      });
  }

  alertTable() {
    return new Promise<void>(resolve => {
      return this.database
        .executeSql(`ALTER TABLE wallets ADD COLUMN _p INTEGER NOT NULL DEFAULT 0`, [])
        .then(data => {
          return this.database
            .executeSql(`ALTER TABLE wallets ADD COLUMN _uuid INTEGER NOT NULL DEFAULT 0`, [])
            .then(data => {
              resolve();
            });
        });
    });
  }

  private _removeWallet(wallet: Wallet): Promise<void> {
    const sqlStatement = `DELETE FROM walls WHERE (_uuid = ?)`;
    return this.database.executeSql(sqlStatement, [wallet._uuid]);
  }

  private _removeAddress(address: WalletAddress): Promise<void> {
    const sqlStatement = `DELETE FROM addrs WHERE (_uuid = ?)`;
    return this.database.executeSql(sqlStatement, [address._uuid]);
  }

  removeWallet(wallet: Wallet): Promise<Wallet[]> {
    const addresses = wallet.addresses;
    const addrsProm = addresses.map(a => this._removeAddress(a));

    return Promise.all([this._removeWallet(wallet), ...addrsProm])
      .then(() => this.wallets.filter(w => w._uuid !== wallet._uuid))
      .then(w => (this.wallets = w))
      .catch(err => {
        console.error('DB - removing a wallet has failed', err);
        throw err;
      });
  }

  removeWalletsOf(uid: UserID): Promise<void> {
    const sqlStatement = `DELETE FROM walls WHERE (uid = ?)`;
    const wallets = this.wallets.filter(w => w.uid === uid);

    return Promise.all([this.database.executeSql(sqlStatement, [uid])])
      .then(() => this.loadWallets())
      .then(() => {})
      .catch(err => {
        console.error(`DB - removing wallets of ${uid} has failed`, err);
        throw err;
      });
  }

  removeAccount(): Promise<void> {
    const sqlStatement = `DELETE FROM accs`;
    return this.database
      .executeSql(sqlStatement, [])
      .then(() => (this.account = null))
      .catch(err => {
        console.error('DB - removing an account has failed', err);
        throw err;
      });
  }

  removeTutorials(uid: UserID): Promise<void> {
    const sqlStatement = `DELETE * FROM tuts WHERE (uid = ?)`;
    return this.database.executeSql(sqlStatement, [uid]).catch(err => {
      console.error('DB - removing tutorials has failed', err);
      throw err;
    });
  }

  setDatabaseVersion(version: number): Promise<number> {
    return this.database
      .executeSql('SELECT * FROM dbv ORDER BY ID DESC LIMIT 1', [])
      .then(d => getItem(d, 0))
      .then((v: any) => {
        const sqlStatement = `UPDATE dbv SET ver = ${version} WHERE id = ${v.id}`;
        return this.database.executeSql(sqlStatement);
      });
  }

  createDatabaseVersion(version: number): Promise<number> {
    const newVersion = { ver: version };

    const sqlKeys = Object.keys(newVersion);
    const sqlValues = Object.values(newVersion);
    const sqlKeyValues = Array.from(sqlKeys, () => '?').join(', ');

    const sqlStatement = `INSERT INTO dbv (${sqlKeys}) VALUES (${sqlKeyValues})`;
    return this.database.executeSql(sqlStatement, sqlValues).then(_ => version);
  }

  getDatabaseVersion(): Promise<number> {
    return this.database
      .executeSql('SELECT * FROM dbv ORDER BY ID DESC LIMIT 1', [])
      .then(d => getItem(d, 0))
      .then(async (v: any) => (v && v.ver > 0 ? v.ver : await this.createDatabaseVersion(1)))
      .then(v => v)
      .catch(err => {
        console.error('Loading database verions has failed', err);
        return 0;
      });
  }

  async updateDatabase(): Promise<void> {
    const currentVersion = await this.getDatabaseVersion();
    let sql;
    console.log('currentVersion', currentVersion);
    try {
      if (currentVersion > -1) {
        sql = await this.http
          .get(`assets/dbUpdates/update-${currentVersion + 1}.sql`, { responseType: 'text' })
          .toPromise()
          .catch(_ => {
            return undefined;
          });
      }

      if (sql === undefined) {
        throw new Error("Get update sql file failed, but it's expected behavior");
        // return;
      }
      await this.sqlitePorter.importSqlToDb(this.database, sql);
      await this.setDatabaseVersion(currentVersion + 1);
    } catch (err) {
      // console.log(err);
      if (err.message?.includes('duplicate column name')) {
        console.log('Column is inserted already, increase version');
        await this.setDatabaseVersion(currentVersion + 1);
      } else {
        console.error('DB: update failed with:', err);
      }
    }
  }

  addTransaction(tx: Transaction): Promise<Transaction> {
    const data: TransactionSqlData = {
      _uuid: tx._uuid,
      addr: tx.address,
      amount: tx.amount,
      blockconfirmed: tx.block,
      ticker: tx.ticker,
      confirmed: fromBool(tx.confirmed),
      txdate: tx.date,
      txhash: tx.hash,
      txtype: tx.type,
      unix: tx.unix,
    };
    const sqlKeys = Object.keys(data);
    const sqlValues = Object.values(data);
    const sqlKeyValues = Array.from(sqlKeys, () => '?').join(', ');
    const sqlStatement = `INSERT INTO tcch (${sqlKeys}) VALUES (${sqlKeyValues})`;

    return this.database
      .executeSql(sqlStatement, sqlValues)
      .then(() => tx)
      .catch(err => {
        console.error('DB - adding an transaction has failed', err);
        throw err;
      });
  }

  updateTransactions(txs: Transaction[]) {
    return txs.forEach(tx => {
      const data: TransactionSqlData = {
        _uuid: tx._uuid,
        addr: tx.address,
        amount: tx.amount,
        blockconfirmed: tx.block,
        ticker: tx.ticker,
        confirmed: fromBool(tx.confirmed),
        txdate: tx.date,
        txhash: tx.hash,
        txtype: tx.type,
        unix: tx.unix,
      };
      const sqlKeys = Object.keys(data);
      const sqlValues = Object.values(data);
      const sqlKeyValues = Array.from(sqlKeys, k => `${k} = ?`).join(', ');
      const sqlWhere = Array.from(['txhash', '_uuid'], k => `${k} = ?`).join(' AND ');

      const sqlStatement = `UPDATE tcch SET ${sqlKeyValues} WHERE ${sqlWhere}`;

      this.database
        .executeSql(sqlStatement, [...sqlValues, tx.hash, tx._uuid])
        .then(() => tx)
        .catch(err => {
          console.error('DB - adding an transaction has failed for', tx._uuid);
          throw err;
        });
    });
  }

  removeTransactions(uuid: UUID): Promise<void> {
    const sqlStatement = `DELETE FROM tcch WHERE (_uuid = ?)`;
    return this.database.executeSql(sqlStatement, [uuid]);
  }

  getWalletTransactionsPage(uuid: UUID, last = 1, limit = 15): Promise<Transaction[]> {
    const sqlStatement = `SELECT * FROM tcch WHERE (_uuid = ?) AND unix > ${last} ORDER BY unix DESC LIMIT ${limit}`;
    return this.database
      .executeSql(sqlStatement, [uuid])
      .then(d => getData<TransactionSqlData>(d))
      .then(d =>
        d.map<Transaction>(t => ({
          _uuid: t._uuid,
          address: t.addr,
          amount: t.amount,
          block: t.blockconfirmed,
          ticker: t.ticker,
          confirmed: toBool(t.confirmed),
          date: t.txdate,
          hash: t.txhash,
          type: t.txtype,
          unix: t.unix,
        })),
      )
      .catch(err => {
        console.error(`DB - getting transaction of ${uuid} with previous ${last} has failed`, err);
        throw err;
      });
    // SELECT *
    // FROM MyTable
    // WHERE SomeColumn > LastValue
    // ORDER BY SomeColumn
    // LIMIT 100;
  }

  getWalletTransactions(uuid: UUID): Promise<Transaction[]> {
    const sqlStatement = `SELECT * FROM tcch WHERE (_uuid = ?) ORDER BY unix DESC LIMIT 20`;

    return this.database
      .executeSql(sqlStatement, [uuid])
      .then(d => getData<TransactionSqlData>(d))
      .then(d =>
        d.map<Transaction>(t => ({
          _uuid: t._uuid,
          address: t.addr,
          amount: t.amount,
          block: t.blockconfirmed,
          ticker: t.ticker,
          confirmed: toBool(t.confirmed),
          date: t.txdate,
          hash: t.txhash,
          type: t.txtype,
          unix: t.unix,
        })),
      )
      .catch(err => {
        console.error(`DB - getting transaction of ${uuid} has failed`, err);
        throw err;
      });
  }

  // forgotPass(email, recover): Promise<string> {
  //   return new Promise<string>((resolve, reject) => {
  //     return this.database.executeSql('SELECT * FROM accounts WHERE email = ?', [email]).then(data => {
  //       if (data.rows.length >= 1) {
  //         const dataa = this.aes.decryptString(data.rows.item([0]).recover, recover);
  //         if (dataa !== undefined) {
  //           resolve(dataa);
  //         } else {
  //           reject(new Error('Master password is not correct'));
  //         }
  //       } else {
  //         reject(new Error('Master password is not correct'));
  //       }
  //     });
  //   });
  // }
}
