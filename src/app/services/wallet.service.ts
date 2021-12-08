import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { filter, isBoolean, map, sortBy, sumBy } from 'lodash';
import { TransactionsService } from './transactions.service';
import { ExplorerService } from './explorer.service';
import {
  Address,
  AddrUtxo,
  Data,
  History,
  Rate,
  Transaction,
  TxType,
  WalletHistory,
  WalletType,
  MasterSeed,
  WalletAddress,
  Wallet,
} from 'src/app/interface/data';
import { IoService } from './io.service';
import { isNullOrEmpty, isSolanaToken, UtilsService, validateSeeds } from './utils.service';
import { AuthenticationProvider } from 'src/app/providers/data/authentication.provider';
import { WalletsProvider } from 'src/app/providers/data/wallets.provider';
import { Acc } from 'src/app/interface/user';
import { Explorer, ExplorerType } from '../interface/explorer';
import { WalletData } from '../providers/wallets/wallet-data';
import { UserID, UUID } from '../interface/global';
import { Balweb3Service } from './apiv2/balance/balweb3.service';
import { BalsolanaService } from './apiv2/balance/balsolana.service';
import { BalpolkadotService } from './apiv2/balance/balpolkadot.service';
import { BalcoinService } from './apiv2/balance/balcoin.service';
import { CheckWalletsService } from './wallets/check-wallets.service';
import { BackendService } from './apiv2/blockchain/backend.service';

export interface WalletsCreator {
  createWallet(walletData: WalletData): Promise<Wallet>;
}

@Injectable({
  providedIn: 'root',
})
export class WalletService {
  walletData = new BehaviorSubject<Data>(null);
  balanceUpdated = new BehaviorSubject<string>(null);
  walletChange: Subscription;
  data: Data = {} as any;

  private readonly GET_BAL_OF = {
    [WalletType.BITCORE_ZCASHY]: this.balCoin.getBalance.bind(this.balCoin),
    [WalletType.BITCORE_LIB]: this.balCoin.getBalance.bind(this.balCoin),
    [WalletType.BITCORE_CUSTOM]: this.balCoin.getBalance.bind(this.balCoin),
    [WalletType.ETH]: this.balWeb3.getBalance.bind(this.balWeb3),
    [WalletType.ETH_TOKEN]: this.balWeb3.getTokenBalance.bind(this.balWeb3),
    [WalletType.BSC]: this.balWeb3.getBalance.bind(this.balWeb3),
    [WalletType.BSC_TOKEN]: this.balWeb3.getTokenBalance.bind(this.balWeb3),
    [WalletType.ETC]: this.balWeb3.getBalance.bind(this.balWeb3),
    [WalletType.SOLANA]: this.balSolana.getBalance.bind(this.balSolana),
    [WalletType.SOLANA_TOKEN]: this.balSolana.getTokenBalance.bind(this.balSolana),
    [WalletType.SOLANA_DEV]: this.balSolana.getBalance.bind(this.balSolana),
    [WalletType.SOLANA_TOKEN_DEV]: this.balSolana.getTokenBalance.bind(this.balSolana),
    [WalletType.POLKADOT]: this.balPolkadot.getBalance.bind(this.balPolkadot),
  };

  constructor(
    private io: IoService,
    private authProvider: AuthenticationProvider,
    private walletsProvider: WalletsProvider,
    private checker: CheckWalletsService,
    private balCoin: BalcoinService,
    private balWeb3: Balweb3Service,
    private balSolana: BalsolanaService,
    private balPolkadot: BalpolkadotService,
    private backendService: BackendService,
  ) {
    this.data = { wallets: [] };
    this.walletChange = this.walletsProvider.wallets$.subscribe(res => {
      if (res) {
        this.data.wallets = res;
        this.walletData.next({
          wallets: res,
        });
      }
    });
  }

  addrBalance(wallet: Wallet, address: string): Promise<any> {
    console.log('Remove this');
    return Promise.resolve(0);
  }

  clearAll() {
    this.io.removeAll('xx');
  }

  clearData() {
    this.walletData.next(null);
  }

  _getDeriveSolana(): Promise<number> {
    return Promise.resolve(0);
  }

  getExplorers(ticker: string, type: WalletType) {
    return [];
  }

  getSeeds(mnemo: string, idt: string) {
    return this.io.decrypt(mnemo, idt);
  }

  getWallet(uuid: UUID): Wallet {
    return this.io.getWallet(uuid);
  }

  getWalletByCoinType(ticker: string, type: WalletType): Wallet {
    return this.walletsProvider.walletsValue.find(
      w => w.ticker?.toLowerCase() === ticker.toLowerCase() && w.type === type,
    );
  }

  getWalletByCoin(ticker: string, uid: UserID): Wallet {
    return this.io.getWalletByCoin(ticker, uid);
  }

  matchWallets(keyVal: Partial<Wallet>): Wallet[] {
    return this.io.matchWallets(keyVal);
  }

  matchWallet(keyVal: Partial<Wallet>): Wallet {
    const wallets = this.matchWallets(keyVal);
    return !!wallets.length ? wallets[0] : null;
  }

  // get wallet balance from network
  getWalletBalance(wallet: Wallet, explorers: Explorer[]): Promise<number> {
    return new Promise((resolve, reject) => {
      const { idt } = this.authProvider.accountValue;
      this.GET_BAL_OF[wallet.type]({
        address: wallet.mainAddress,
        type: wallet.type,
        addresses: [wallet.mainAddress],
        explorers,
        contractAddress: wallet.contractaddress,
        abi: this.io.getAbi(wallet.contractaddress, wallet.type),
        api: wallet.api,
        seeds: this.getSeeds(wallet.mnemo, idt),
        ticker: wallet.ticker,
        uuid: wallet._uuid,
      })
        .then(bal => {
          wallet.balance = bal;
          wallet.isInitialized = true;
          this.updateWallet(wallet._uuid, wallet, true);
          resolve(bal);
        })
        .catch(reject);
    });
  }

  // getWalletHistory(uuid: UUID): WalletHistory[] {
  //   return this.io.getWalletHistory(uuid);
  // }

  getWalletsOf(id?: UserID): Wallet[] {
    const uid = id || this.authProvider.accountValue.uid;
    const wallets = this.io.matchWallets({ uid });
    if (this.walletsProvider.walletValue) {
      this.walletsProvider.pushWallet(this.io.getWallet(this.walletsProvider.walletValue._uuid));
    }

    return this.walletsProvider.pushWallets(wallets);
  }

  getTransactionsOf(
    wallet: Wallet,
    pagination?: { last: number; limit?: number },
  ): Promise<Transaction[]> {
    return !!pagination
      ? this.io.getTrasactionPageOf(wallet, pagination.last, pagination?.limit)
      : this.io.getTransactionsOf(wallet);
  }

  removeWallet(wallet: Wallet): Promise<Wallet[]> {
    return this.io
      .removeWallet(wallet)
      .then(() => this.io.removeTransactions(wallet._uuid))
      .then(_ => this.matchWallets({ uid: this.authProvider.accountValue.uid }))
      .then(w => this.walletsProvider.pushWallets(w));
  }

  private cleanTransaction(uuid: UUID): Promise<void> {
    return this.io.removeTransactions(uuid);
  }

  // @TODO - fix rescan behavior
  async rescanWallet(uuid: string, account: Acc) {
    console.log('Rescan, @TODO', uuid);
    const wallet = this.getWallet(uuid);
    wallet.transactions = [];
    if (isNullOrEmpty(wallet.tokenAddress) && isSolanaToken(wallet.type)) {
      const tokenAddress = await this.getTokenAddress({
        type: wallet.type,
        contractAddress: wallet.contractaddress,
        address: wallet.mainAddress,
      });
      wallet.tokenAddress = tokenAddress.toString();
    }
    wallet.lasttx = '';
    this.cleanTransaction(wallet._uuid).then(_ =>
      this.checker.checkTransactions({
        wallets: [wallet],
        important: true,
      }),
    );
  }

  getTokenAddress(data: {
    type: WalletType;
    contractAddress: string;
    address: string;
    api?: string;
  }) {
    switch (data.type) {
      case WalletType.SOLANA_TOKEN_DEV:
      case WalletType.SOLANA_TOKEN:
        return this.backendService.getTokenAddress(data);
      default:
        return data.address;
    }
  }

  // @todo are we ever need these methods?
  saveWallets(wallet: Wallet[]) {
    // this.ioService.updateWallet
  }

  scanWallet() {
    // update balance
    // update priv key
  }

  sum(items, isMine) {
    const filters = { isMine: undefined };
    if (isBoolean(isMine)) {
      filters.isMine = isMine;
    }
    return sumBy(filter(items, filter), item => parseFloat(item.amount));
  }

  sumVout(items, isMine, isChange?) {
    const filters = { isMine: undefined, isChange: undefined };
    if (isBoolean(isMine)) {
      filters.isMine = isMine;
    }
    if (isBoolean(isChange)) {
      filters.isChange = isChange;
    }
    return sumBy(filter(items, filters), item => parseFloat(item.amount));
  }

  updateWallet(uuid: UUID, wallet: Partial<Wallet>, updateTransaction: boolean): Promise<Wallet> {
    const w = this.walletsProvider.allWalletsValue.find(w => w._uuid === uuid);
    const updatedWallet: Wallet = { ...w, ...wallet };
    return this.io
      .addTransactionOf(updatedWallet, updateTransaction)
      .then(() => this.io.updateWallet(updatedWallet))
      .then(() => this.getWalletsOf())
      .then(() => updatedWallet);
  }

  updateWallets(
    wallets: Wallet[],
    onSuccess = (_wallets: Wallet[]) => {},
    onError = (_err: Error) => {},
  ) {
    this.io
      .updateWallets(wallets)
      .then(() => this.getWalletsOf())
      .then(onSuccess)
      .catch(onError);
  }

  validateSeeds(seeds): boolean {
    return validateSeeds(seeds);
  }
}
