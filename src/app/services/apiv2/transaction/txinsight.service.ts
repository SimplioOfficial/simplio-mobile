import { Injectable } from '@angular/core';
import { Transaction, TransactionAPI, TxType, WalletType } from 'src/app/interface/data';
import { Explorer } from 'src/app/interface/explorer';
import { TransactionData, TransactionDataResponse } from '../../transactions.service';
import { pipeAmount } from '../../utils.service';
import { NetworkService } from '../connection/network.service';
import { TxBase } from './txbase';

@Injectable({
  providedIn: 'root',
})
export class TxinsightService extends TxBase {
  constructor(private networkService: NetworkService) {
    super('TxInsight');
  }

  init() { }

  getTxs(data: {
    walletUnit: TransactionData;
    explorers: Explorer[];
  }): Promise<TransactionDataResponse> {
    return new Promise((resolve, reject) => {
      const { _uuid, addresses } = data.walletUnit;
      let explorers = [...data.explorers.sort((a, b) => b.priority - a.priority)];
      if (explorers.length > 0) {
        const params = {
          addrs: addresses.join(','),
          from: 0,
          to: 10,
        };
        const extend = '/addrs/txs';
        const ex = explorers.pop();
        getTxs(this, ex, extend, params);

        function getTxs(self, explorer, extend, params) {
          self.networkService
            .postData(explorer, extend, params)
            .then(dat => {
              return resolve({
                _uuid,
                explorer,
                wallet: data.walletUnit.wallet,
                data: self.parseTxs({
                  txs: dat,
                  ticker: data.walletUnit.ticker,
                  type: data.walletUnit.type,
                  uuid: data.walletUnit._uuid,
                  addresses: data.walletUnit.addresses,
                }),
              });
            })
            .catch(err => {
              if (explorers.length > 0) {
                const ex = explorers.pop();
                console.log('Get transaction switch to', ex.api);
                getTxs(self, ex, extend, params);
              } else {
                // console.error(err);
                reject(new Error(_uuid + '/001'));
              }
            });
        }
      } else {
        reject(new Error(_uuid + '/001'));
      }
    });
  }

  private _classify(addressesList, items) {
    return items.map(item => {
      const index = addressesList.findIndex(a => a === item.addr);
      return {
        address: item.addr,
        amount: item.value,
        isMine: index > -1,
      };
    });
  }

  private _classifyVout(addressesList, items) {
    return items
      .map(item => {
        const { addresses = null } = item.scriptPubKey ? item.scriptPubKey : item;
        const primAddress = addresses ? addresses[0] : null;
        if (!primAddress) {
          return null;
        }
        const address = addressesList.find(a => a === primAddress);
        return {
          address: primAddress,
          amount: item.value,
          isMine: !!address,
        };
      })
      .filter(i => i !== null);
  }

  parseTxs(data: {
    txs: TransactionAPI;
    addresses: string[];
    uuid: string;
    type: WalletType;
    ticker: string;
  }): Transaction[] {
    const addressesList = data.addresses;
    const txs: Transaction[] = [];
    addressesList.forEach(a => {
      data.txs?.items?.forEach(tx => {
        if (tx.vin.length || tx.vout.length) {
          let index = 0;
          let isOut = false;
          let action: TxType = TxType.SEND;

          index = tx.vin.findIndex(e => e.addr === a);
          isOut = tx.vout.some(element => {
            if (element.scriptPubKey && element.scriptPubKey.addresses) {
              const index2 = element.scriptPubKey?.addresses?.indexOf(a);
              if (index2 > -1) {
                return true;
              }
            }
          });

          if (index > -1 || isOut === true) {
            let amountIn = 0;
            let amountInMine = 0;
            let amountOut = 0;
            let amountOutMine = 0;
            let amount = 0;
            let addressTo;
            let inputs;
            let outputs;
            if (tx.vin.length || tx.vout.length) {
              inputs = this._classify(addressesList, tx.vin);
              outputs = this._classifyVout(addressesList, tx.vout);

              amountIn = pipeAmount(this.sum(inputs, false), data.ticker, data.type, undefined);
              amountInMine = pipeAmount(this.sum(inputs, true), data.ticker, data.type, undefined);
              amountOutMine = pipeAmount(
                this.sumVout(outputs, true),
                data.ticker,
                data.type,
                undefined,
              );
              amountOut = pipeAmount(
                this.sumVout(outputs, false),
                data.ticker,
                data.type,
                undefined,
              );

              const fee = pipeAmount(tx.fees, data.ticker, data.type, undefined);

              if (amountInMine === amountOutMine + fee) {
                amount = amountOutMine;
                action = TxType.MOVE;
              } else if (amountInMine === 0) {
                amount = amountOutMine;
                action = TxType.RECEIVE;
              } else {
                amount = amountOut > 0 ? amountOut : amountIn;
                action = amountOut > 0 ? TxType.SEND : TxType.RECEIVE;
              }
              amount = Math.abs(amount);

              if (action === TxType.SEND) {
                let firstExternalOutput = 'N/A';
                outputs.some(element => {
                  if (element.address !== a) {
                    firstExternalOutput = element.address;
                    return true;
                  }
                });
                addressTo = firstExternalOutput;
              } else {
                addressTo = inputs[0]?.address || "N/A";
              }
            }
            const u = tx.blocktime ? tx.blocktime : tx.blockTime;
            const height = tx.blockheight ? tx.blockheight : tx.blockHeight;
            const t: Transaction = {
              _uuid: data.uuid,
              type: action,
              ticker: data.ticker,
              address: addressTo,
              amount,
              hash: tx.txid,
              unix: u,
              confirmed:
                tx.confirmations === undefined || Number(tx.confirmations) <= 0 ? false : true,
              date:
                Number(tx.confirmations) === 0
                  ? 'Not confirmed yet'
                  : new Date(u * 1000).toLocaleString('ja-JP', {
                    hour12: false,
                  }),
              block: height,
            };
            if (txs.findIndex(e => e.hash === t.hash) === -1) txs.push(t);
          }
        }
      });
    });
    return txs;
  }

  getUtxo(data: { explorers: Explorer[]; addresses: string[] }): Promise<any> {
    return new Promise(resolve => {
      const params = {
        addrs: data.addresses.join(','),
      };
      let explorers = [...data.explorers.sort((a, b) => b.priority - a.priority)];
      const ex = explorers.pop();
      getUtxos(this, ex, params);

      function getUtxos(self, ex, params) {
        console.log(explorers);
        self.networkService
          .post(ex.api + '/addrs/utxo', params)
          .then(utxos => {
            resolve({
              utxos: utxos.sort((a, b) => b.satoshis - a.satoshis),
              explorer: ex,
            });
          })
          .catch(err => {
            if (explorers.length > 0) {
              const ex = explorers.pop();
              console.log('Get transaction switch to', ex.api);
              getUtxos(self, ex, params);
            } else {
              // console.error(err);
              resolve({
                utxos: [],
                explorer: undefined,
              });
            }
          });
      }
    });
  }

  broadcastTx(data: { explorer: Explorer; rawtx: string }): Promise<string> {
    const rawtx = data.rawtx;
    return this.networkService
      .post<any>(data.explorer.api + '/tx/send', { rawtx })
      .then(res => res.txid);
  }
}
