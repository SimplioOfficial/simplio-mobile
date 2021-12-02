import { Injectable } from '@angular/core';
import { TxBase } from './txbase';
import { NetworkService } from '../connection/network.service';
import { AddrUtxo, Transaction, TransactionAPI, TxType, WalletType } from 'src/app/interface/data';
import { TransactionData, TransactionDataResponse } from '../../transactions.service';
import { Explorer } from 'src/app/interface/explorer';
import { pipeAmount } from '../../utils.service';
import { isObject } from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class TxblockbookService extends TxBase {
  constructor(private networkService: NetworkService) {
    super('TxBlockbook');
  }

  init() {}

  private _getData(explorer, addr, url) {
    return new Promise((resolve, reject) => {
      this.networkService
        .getData<any>(explorer, '/v2/address/' + addr + '?page=0&pageSize=10&details=txs', url)
        .then(res => {
          let ele;
          if (isObject(res)) {
            ele = res;
          } else {
            ele = JSON.parse(res);
          }
          resolve(ele);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  private _getAddressTxs(data: {
    explorer: Explorer;
    params: any;
    url?: string;
  }): Promise<TransactionAPI> {
    return new Promise((resolve, reject) => {
      // api/v2/address/bitcoincash:qzkpyvyanh22jyy8tm80al3jwvv49q2s9v5qk6s2c5?page=1&pageSize=1&details=txs
      const txs: TransactionAPI = {
        explorer: data.explorer,
        from: 0,
        to: 1,
      };
      const addrs = data.params.addrs.split(',');
      const promisesToMake = [];
      addrs.forEach(element => {
        promisesToMake.push(this._getData(data.explorer, element, data.url));
      });
      const results = Promise.all(promisesToMake);
      results
        .then(result => {
          result.forEach(items => {
            if (items.transactions !== undefined) {
              items.transactions.forEach(e => {
                if (txs.items === undefined) {
                  txs.items = [e];
                } else {
                  if (txs.items.findIndex(ee => ee.txid === e.txid) === -1) txs.items.push(e);
                }
              });
            }
            resolve(txs);
          });
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  private _classifyV2(addressesList, items, coin, type) {
    return items.map(item => {
      const index = addressesList.findIndex(a => item.addresses.indexOf(a) > -1);
      return {
        address: item.addresses?.length > 0 ? item.addresses[0] : undefined,
        amount: pipeAmount(item.value, coin, type, undefined, true),
        isMine: index > -1 ? true : false,
      };
    });
  }

  private _classifyVoutV2(addressesList, items, coin, type) {
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
          amount: pipeAmount(item.value, coin, type, undefined, true),
          isMine: address ? true : false,
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

          index = tx.vin.findIndex(e => e.addresses.indexOf(a) > -1);
          isOut = tx.vout.some(element => {
            if (element.addresses !== undefined) {
              const index2 = element.addresses?.indexOf(a);
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
              inputs = this._classifyV2(addressesList, tx.vin, data.ticker, data.type);
              outputs = this._classifyVoutV2(addressesList, tx.vout, data.ticker, data.type);

              amountIn = pipeAmount(this.sum(inputs, false), data.ticker, data.type, undefined);
              amountInMine = pipeAmount(this.sum(inputs, true), data.ticker, data.type, undefined);
              amountOut = pipeAmount(
                this.sumVout(outputs, false),
                data.ticker,
                data.type,
                undefined,
              );
              amountOutMine = pipeAmount(
                this.sumVout(outputs, true),
                data.ticker,
                data.type,
                undefined,
              );

              const fee = Number(tx.fees);

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
                addressTo = inputs[0].address;
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

  getTxs(data: {
    walletUnit: TransactionData;
    explorers: Explorer[];
  }): Promise<TransactionDataResponse> {
    return new Promise((resolve, reject) => {
      const { _uuid, addresses } = data.walletUnit;
      const params = {
        addrs: addresses.join(','),
        from: 0,
        to: 10,
      };
      let explorers = [...data.explorers.sort((a, b) => b.priority - a.priority)];
      const ex = explorers.pop();
      getTxs(this, { explorer: ex, params });

      function getTxs(self, txInput: { explorer; params }) {
        self
          ._getAddressTxs(txInput)
          .then(dat => {
            return resolve({
              _uuid,
              wallet: data.walletUnit.wallet,
              explorer: txInput.explorer,
              data: self.parseTxs({
                txs: dat,
                addresses: data.walletUnit.addresses,
                uuid: data.walletUnit._uuid,
                type: data.walletUnit.type,
                ticker: data.walletUnit.ticker,
              }),
            });
          })
          .catch(err => {
            if (explorers.length > 0) {
              const ex = explorers.pop();
              console.log('Get transaction switch to', ex.api);
              getTxs(self, txInput);
            } else {
              // console.error(err);
              reject(new Error(_uuid + '/001'));
            }
          });
      }
    });
  }

  getUtxo(data: { explorers: Explorer[]; addresses: string[] }): Promise<any> {
    return new Promise((resolve, reject) => {
      let explorers = [...data.explorers.sort((a, b) => b.priority - a.priority)];
      const ex = explorers.pop();
      getUtxos(this, ex, data.addresses);

      function getUtxos(self, ex, addresses) {
        const promisesToMake = [];
        addresses.forEach(addr => {
          promisesToMake.push(self.networkService.get(ex.api + '/v2/utxo/' + addr));
        });
        const utxos: AddrUtxo[] = [];
        Promise.all(promisesToMake)
          .then(res => {
            for (const [index, ele] of res.entries()) {
              ele.forEach(e => {
                utxos.push({
                  address: addresses[index],
                  confirmations: e.confirmations,
                  height: 0,
                  satoshis: Number(e.value),
                  txid: e.txid,
                  vout: e.vout,
                });
              });
            }
            resolve({
              utxos: utxos.sort((a, b) => b.satoshis - a.satoshis),
              explorer: ex,
            });
          })
          .catch(_ => {
            if (explorers.length > 0) {
              const ex = explorers.pop();
              console.log('Get utxo switch to', ex.api);
              getUtxos(self, ex, addresses);
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

  broadcastTx(data: { explorer: Explorer; rawtx: string }): Promise<any> {
    const rawtx = data.rawtx;
    return this.networkService
      .postCustom<any>(data.explorer.api + '/v2/sendtx/', rawtx, 'text/html')
      .then(res => res.result);
  }
}
