import { UtilsService } from './utils.service';

import { Transaction, Wallet } from './../interface/data';
import { Injectable } from '@angular/core';
import { WalletType } from 'src/app/interface/data';
import { TransactionsProvider } from 'src/app/providers/data/transactions.provider';

import { UUID } from 'src/app/interface/global';
import { Explorer, ExplorerType } from '../interface/explorer';
import { Txweb3Service } from './apiv2/transaction/txweb3.service';
import { TxsolanaService } from './apiv2/transaction/txsolana.service';
import { TxSafecoinService } from './apiv2/transaction/txsafecoin.service';
import { TxpolkadotService } from './apiv2/transaction/txpolkadot.service';
import { NetworkService } from './apiv2/connection/network.service';
import { TxcoinService } from './apiv2/transaction/txcoin.service';

export type TransactionDataResponse = {
  _uuid: string;
  explorer?: Explorer;
  wallet?: Wallet;
  data: Transaction[];
  startBlock?: number;
  endBlock?: number;
};
export type TransactionDataSuccessHandler = (res: TransactionDataResponse) => void;
export type TransactionDataSuccessHandlerMultiple = (res: TransactionDataResponse[]) => void;
export type TransactionDataErrorHandler = (err: Error) => void;
export type TransactionData = {
  _uuid: UUID;
  ticker: string;
  seeds?: string;
  type?: WalletType;
  addresses: string[];
  tokenAddress: string;
  lastBlock?: number;
  tokenId?: string;
  api?: string;
  wallet: Wallet;
  important?: boolean;
};

@Injectable({
  providedIn: 'root',
})
export class TransactionsService {
  private readonly GET_TX_OF = {
    [WalletType.BITCORE_ZCASHY]: this.txcoin.getTxs.bind(this.txcoin),
    [WalletType.BITCORE_LIB]: this.txcoin.getTxs.bind(this.txcoin),
    [WalletType.BITCORE_CUSTOM]: this.txcoin.getTxs.bind(this.txcoin),
    [WalletType.ETH]: this.txweb3.getTxs.bind(this.txweb3),
    [WalletType.ETH_TOKEN]: this.txweb3.getTxs.bind(this.txweb3),
    [WalletType.BSC]: this.txweb3.getTxs.bind(this.txweb3),
    [WalletType.BSC_TOKEN]: this.txweb3.getTxs.bind(this.txweb3),
    [WalletType.ETC]: this.txweb3.getTxs.bind(this.txweb3),
    [WalletType.SOLANA]: this.txsolana.getTxs.bind(this.txsolana),
    [WalletType.SOLANA_TOKEN]: this.txsolana.getTxsToken.bind(this.txsolana),
    [WalletType.SOLANA_DEV]: this.txsolana.getTxs.bind(this.txsolana),
    [WalletType.SOLANA_TOKEN_DEV]: this.txsolana.getTxsToken.bind(this.txsolana),
    [WalletType.SAFE]: this.txsafecoin.getTxs.bind(this.txsafecoin),
    [WalletType.SAFE_TOKEN]: this.txsafecoin.getTxsToken.bind(this.txsafecoin),
  };

  private readonly GET_TX_MULTIPLE_OF = {
    [WalletType.ETH_TOKEN]: this.txweb3.getTxsMultiple.bind(this.txweb3),
    [WalletType.BSC_TOKEN]: this.txweb3.getTxsMultiple.bind(this.txweb3),
    [WalletType.SOLANA_TOKEN]: this.txsolana.getTxsTokens.bind(this.txsolana),
    [WalletType.SOLANA_TOKEN_DEV]: this.txsolana.getTxsTokens.bind(this.txsolana),
    [WalletType.SAFE_TOKEN]: this.txsafecoin.getTxsTokens.bind(this.txsafecoin),
  };

  constructor(
    public utilsService: UtilsService,
    private transactionProvider: TransactionsProvider,
    private txcoin: TxcoinService,
    private txweb3: Txweb3Service,
    private txsolana: TxsolanaService,
    private txsafecoin: TxSafecoinService,
    private txpolkadot: TxpolkadotService,
    private networkService: NetworkService,
  ) {}

  getTransactionOfAsync(walletUnit: TransactionData): Promise<TransactionDataResponse> {
    return new Promise((resolve, reject) => {
      let explorers = this.networkService.getCoinExplorers(walletUnit.ticker, walletUnit.type);
      if (!!explorers?.length) {
        explorers = explorers.filter(e => e.type === explorers[0].type);
      }
      this.GET_TX_OF[walletUnit.type]({
        walletUnit,
        explorers,
      })
        .then(resolve)
        .catch(_ => reject(new Error(walletUnit._uuid + '/003')));
    });
  }

  getTransactionMultipleOfAsync(
    walletUnits: TransactionData[],
  ): Promise<TransactionDataResponse[]> {
    return new Promise((resolve, reject) => {
      let explorers = this.networkService.getCoinExplorers(undefined, walletUnits[0].type);
      if (!!explorers?.length) {
        explorers = explorers.filter(e => e.type === explorers[0].type);
      }
      this.GET_TX_MULTIPLE_OF[walletUnits[0].type]({
        walletUnits,
        explorers,
      })
        .then(resolve)
        .catch(reject);
    });
  }

  clearData() {
    this.transactionProvider.pushTransactions(null);
  } // this.utilsService.grantCameraPermission(onSuccess, onError);
}
