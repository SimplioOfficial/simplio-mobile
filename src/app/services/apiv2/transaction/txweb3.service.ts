import { Injectable } from '@angular/core';
import { isObject, result } from 'lodash';
import { Transaction, TransactionAPI, TxType, WalletType } from 'src/app/interface/data';
import { Explorer, ExplorerType } from 'src/app/interface/explorer';
import { environment } from 'src/environments/environment';
import { TransactionData, TransactionDataResponse } from '../../transactions.service';
import { UtilsService } from '../../utils.service';
import { BackendService } from '../blockchain/backend.service';
import { NetworkService } from '../connection/network.service';
import { TxBase } from './txbase';

@Injectable({
  providedIn: 'root',
})
export class Txweb3Service extends TxBase {
  constructor(private networkService: NetworkService, private backendService: BackendService) {
    super('Txweb3Service');
  }

  init() {}

  getLastBlock(type: WalletType): Promise<any> {
    return new Promise((resolve, reject) => {
      this.backendService.web3.getLib(type).eth.getBlockNumber().then(resolve).catch(reject);
    });
  }

  async getTxs(data: {
    walletUnit: TransactionData;
    explorers: Explorer[];
    retry?: number;
  }): Promise<TransactionDataResponse> {
    // return new Promise((resolve, reject) => {
    try {
      const lastBlock = await this.getLastBlock(data.walletUnit.type);
      let url = data.explorers[0].api_transaction
        .replace('<address>', data.walletUnit.addresses[0])
        .replace('<start>', '0')
        .replace('<end>', lastBlock.toString());
      if (!url.includes('offset')) {
        url += '&offset=20';
      }
      if (UtilsService.isErcToken(data.walletUnit.type)) {
        url = url.replace('<contractaddress>', data.walletUnit.tokenId);
      }
      return this.networkService
        .get(url)
        .then((res: { result: any }) => {
          return {
            _uuid: data.walletUnit._uuid,
            wallet: data.walletUnit.wallet,
            explorer: data.explorers[0],
            endBlock: lastBlock,
            data: this.parseTxs({
              txs: {
                from: 0,
                to: 1,
                explorer: data.explorers[0],
                tokenItem: res.result,
              },
              address: data.walletUnit.addresses[0].toLowerCase(),
              uuid: data.walletUnit._uuid,
              ticker: data.walletUnit.ticker,
              reverse: UtilsService.isErcToken(data.walletUnit.type),
            }),
          };
        })
        .catch(err => {
          if (!data.retry) {
            data.retry = 0;
          }
          ++data.retry;
          if (data.retry >= 4) {
            throw new Error(data.walletUnit._uuid + '/001');
          } else {
            return new Promise((resolve, reject) =>
              setTimeout(() => {
                console.log(
                  'Count retry for',
                  data.walletUnit.ticker,
                  data.walletUnit._uuid,
                  data.retry,
                );
                return this.getTxs(data).then(resolve).catch(reject);
              }, Math.trunc(Math.random() * 3000)),
            );
          }
        });
    } catch (_) {
      throw new Error(data.walletUnit._uuid + '/001');
    }
  }

  async getTxsMultiple(data: {
    walletUnits: TransactionData[];
    explorers: Explorer[];
    retry?: number;
  }): Promise<TransactionDataResponse[]> {
    // return new Promise((resolve, reject) => {
    try {
      const lastBlock = await this.getLastBlock(data.walletUnits[0].type);
      // const startBlock = lastBlock - 6500 * 30; // scan the last 30 days
      const startBlock = Math.min(...data.walletUnits.map(e => e.lastBlock));
      // const startBlock = 0;
      // console.log("Start block", startBlock);
      let url = data.explorers[0].api_transaction2
        .replace('<address>', data.walletUnits[0].addresses[0])
        .replace('<start>', startBlock.toString())
        .replace('<end>', lastBlock);
      if (!url.includes('offset')) {
        url += '&offset=500';
      }
      const txResponse: TransactionDataResponse[] = [];
      return this.networkService
        .get(url)
        .then((res: { result: any[] }) => {
          data.walletUnits.forEach(walletUnit => {
            const txlist = res.result.filter(e => e.contractAddress === walletUnit.tokenId);
            const d: TransactionDataResponse = {
              _uuid: walletUnit._uuid,
              explorer: data.explorers[0],
              data: this.parseTxs({
                txs: {
                  from: 0,
                  to: lastBlock,
                  explorer: data.explorers[0],
                  tokenItem: txlist,
                },
                address: walletUnit.addresses[0].toLowerCase(),
                uuid: walletUnit._uuid,
                ticker: walletUnit.ticker,
                reverse: UtilsService.isErcToken(walletUnit.type),
              }),
              wallet: walletUnit.wallet,
              startBlock,
              endBlock: lastBlock,
            };
            txResponse.push(d);
          });
          return txResponse;
        })
        .catch(err => {
          if (!data.retry) {
            data.retry = 0;
          }
          ++data.retry;
          if (data.retry >= 4) {
            throw new Error('Get multiple transaction error' + '/003');
          } else {
            return new Promise((resolve, reject) =>
              setTimeout(() => {
                console.log(
                  'Count retry for multiple transaction, url',
                  data.explorers[0].url.split('/api')[0],
                  ',count',
                  data.retry,
                );
                return this.getTxsMultiple(data).then(resolve).catch(reject);
              }, Math.trunc(Math.random() * 3000)),
            );
          }
        });
    } catch (_) {
      throw new Error('Get multiple transaction error' + '/003');
    }
  }

  parseTxs(data: {
    txs: TransactionAPI;
    address: string;
    uuid: string;
    ticker: string;
    reverse: boolean;
  }): Transaction[] {
    const txs: Transaction[] = [];
    if (isObject(data.txs) && data.txs.tokenItem.length > 0) {
      data.txs.tokenItem.forEach(tx => {
        let action: TxType = TxType.UNKNOWN;
        if (tx.from === data.address && tx.to === data.address) {
          action = TxType.MOVE;
        } else if (tx.from === data.address && tx.to !== data.address) {
          action = TxType.SEND;
        } else if (tx.from !== data.address && tx.to === data.address) {
          action = TxType.RECEIVE;
        }

        const t: Transaction = {
          _uuid: data.uuid,
          type: action,
          ticker: data.ticker,
          address: action == TxType.RECEIVE ? tx.from : tx.to,
          amount: parseInt(tx.value, 10),
          hash: tx.hash,
          unix: Number(tx.timeStamp),
          confirmed: !(tx.confirmations === undefined || Number(tx.confirmations) <= 0),
          date:
            Number(tx.confirmations) === 0
              ? 'Not confirmed yet'
              : new Date(Number(tx.timeStamp) * 1000).toLocaleString('ja-JP', {
                  hour12: false,
                }),
          block: parseInt(tx.blockNumber, 10),
        };
        if (txs.findIndex(e => e.hash === t.hash) === -1) txs.push(t);
      });
    }
    return data.reverse === true ? txs.reverse() : txs;
  }
}
