import { Injectable } from '@angular/core';
import { TxBase } from './txbase';
import * as safecoinWeb3 from '@safecoin/web3.js';
import { TransactionData, TransactionDataResponse } from '../../transactions.service';
import { Transaction, TransactionAPI, TxType } from 'src/app/interface/data';
import { NetworkService } from '../connection/network.service';
import { BackendService } from '../blockchain/backend.service';

@Injectable({
  providedIn: 'root',
})
export class TxSafecoinService extends TxBase {
  constructor(private backendService: BackendService, private networkService: NetworkService) {
    super('TxSafecoin');
  }

  init() { }

  getHistoryToken(data: {
    tokenId: string;
    api: string;
    address: string;
    count: number;
    ticker: string;
    txData: TransactionData;
    important?: boolean;
  }): Promise<any> {
    return new Promise(async (resolve, reject) => {
      function retry(self: TxSafecoinService, data) {
        return new Promise(async (resolve2, reject2) => {
          if (data.count < 5) {
            data.count += 1;
            console.log('Count retry for', data.ticker, data.count);
            setTimeout(() => {
              self.getHistoryToken(data).then(resolve2).catch(reject2);
            }, Math.trunc(Math.random() * 3000));
          } else {
            reject2(new Error('Cannot get transaction for ' + data.ticker));
          }
        });
      }

      try {
        const apiUrl = this.backendService.getSafeApi(data);
        const connection = this.backendService.safecoin.getConnection({ api: apiUrl });
        // const myMint = new safecoinWeb3.PublicKey(data.tokenId);
        const address = new safecoinWeb3.PublicKey(data.address);
        const txs = [];

        return connection
          .getConfirmedSignaturesForAddress2(address, { limit: 20 }, 'confirmed')
          .then(res2 => {
            for (const [index, element] of res2.entries()) {
              txs.push({
                address: address,
                txs: element,
              });
            }
            resolve({ txs, txData: data.txData });
          })
          .catch(err => {
            retry(this, data).then(resolve).catch(reject);
          });
        // }
      } catch (err) {
        retry(this, data).then(resolve).catch(reject);
      }
    });
  }

  getHistory(data: {
    address: string;
    api: string;
    count: number;
    ticker: string;
    important?: boolean;
  }): Promise<any[]> {
    const publickey = new safecoinWeb3.PublicKey(data.address);
    const apiUrl = this.backendService.getSafeApi(data);
    const connection = this.backendService.safecoin.getConnection({ api: apiUrl });
    return connection
      .getConfirmedSignaturesForAddress2(publickey, { limit: 20 }, 'confirmed')
      .then(txs => {
        // console.log(data.ticker, txs);
        return [
          {
            address: data.address,
            txs,
          },
        ];
      })
      .catch(_ => {
        if (data.count < 5) {
          data.count += 1;
          console.log('Count retry for', data.ticker, data.count);
          return new Promise((resolve, reject) =>
            setTimeout(() => {
              return this.getHistory(data).then(resolve).catch(reject);
            }, Math.trunc(Math.random() * 3000)),
          );
        } else {
          return [];
        }
      });
  }

  async getTxs(data: { walletUnit: TransactionData }): Promise<TransactionDataResponse> {
    return this.getHistory({
      address: data.walletUnit.addresses[0],
      api: data.walletUnit.api,
      count: 0,
      ticker: data.walletUnit.ticker,
      important: data.walletUnit.important,
    })
      .then(async safecoinTxs => {
        let dataParser = [];
        await Promise.all(
          safecoinTxs.map(async e => {
            dataParser = dataParser.concat(
              await this.parseTxs({
                txs: {
                  from: 0,
                  to: 1,
                  explorer: null,
                  safecoinTxs: e.txs,
                },
                address: e.address,
                ticker: data.walletUnit.ticker,
                uuid: data.walletUnit._uuid,
                api: data.walletUnit.api,
                timeout: Math.trunc(Math.max(Math.random() * safecoinTxs.length * 500, 200)),
              }),
            );
          }),
        );
        return {
          _uuid: data.walletUnit._uuid,
          wallet: data.walletUnit.wallet,
          data: dataParser,
        };
      })
      .catch(err => {
        return {
          _uuid: data.walletUnit._uuid,
          wallet: data.walletUnit.wallet,
          data: [],
        };
      });
  }

  async getTxsToken(data: { walletUnit: TransactionData }): Promise<TransactionDataResponse> {
    return this.getHistoryToken({
      api: data.walletUnit.api,
      address: data.walletUnit.tokenAddress,
      tokenId: data.walletUnit.tokenId,
      count: 0,
      ticker: data.walletUnit.ticker,
      txData: data.walletUnit,
      important: data.walletUnit.important,
    })
      .then(async safecoinTxs => {
        const txs = safecoinTxs.txs.reduce((t, curr) => {
          t = t.concat(curr.txs);
          return t;
        }, []);
        const addrs = safecoinTxs.txs.reduce((a, curr) => {
          if (!a.includes(curr.address)) a.push(curr.address);
          return a;
        }, []);
        if (txs.length > 0) {
          return {
            _uuid: data.walletUnit._uuid,
            wallet: data.walletUnit.wallet,
            data: await this.parseTxsToken({
              txs: {
                from: 0,
                to: 1,
                explorer: null,
                safecoinTxs: txs,
              },
              addresses: addrs,
              ticker: data.walletUnit.ticker,
              uuid: data.walletUnit._uuid,
              api: data.walletUnit.api,
              tokenId: data.walletUnit.tokenId,
              timeout: Math.trunc(Math.max(Math.random() * safecoinTxs.length * 500, 200)),
            }),
          };
        } else {
          return {
            _uuid: data.walletUnit._uuid,
            data: [],
          };
        }
      })
      .catch(err => {
        return {
          _uuid: data.walletUnit._uuid,
          data: [],
        };
      });
  }

  async getTxsTokens(data: { walletUnits: TransactionData[] }): Promise<TransactionDataResponse[]> {
    return new Promise((resolve, reject) => {
      const promisesToMake = [];
      data.walletUnits.forEach(e => {
        promisesToMake.push(
          this.getHistoryToken({
            api: e.api,
            address: e.tokenAddress,
            tokenId: e.tokenId,
            count: 0,
            ticker: e.ticker,
            txData: e,
            important: e.important,
          }),
        );
      });
      const allTxs = [];
      Promise.all(promisesToMake)
        .then(async res => {
          if (res.length > 0) {
            let all = [];
            res.forEach(e =>
              all.push(
                e.txs.reduce((t, curr) => {
                  t = t.concat(curr.txs);
                  return t;
                }, []),
              ),
            );
            all = all.flat();
            all = all.map(t => t.signature);
            const apiUrl = this.backendService.getSafeApi({ api: res[0].txData.api });
            const connection = this.backendService.safecoin.getConnection({ api: apiUrl });
            const confirmedTransactions = await connection.getParsedConfirmedTransactions(all);

            res.forEach(async safecoinTxs => {
              const txs = safecoinTxs.txs.reduce((t, curr) => {
                t = t.concat(curr.txs);
                return t;
              }, []);
              const addrs = safecoinTxs.txs.reduce((a, curr) => {
                if (!a.includes(curr.address)) a.push(curr.address);
                return a;
              }, []);

              allTxs.push({
                _uuid: safecoinTxs.txData._uuid,
                wallet: safecoinTxs.txData.wallet,
                data: await this.parseTxsToken2({
                  txs: confirmedTransactions.filter(c =>
                    txs.find(t => c?.transaction?.signatures.includes(t.signature)),
                  ),
                  address: addrs,
                  ticker: safecoinTxs.txData.ticker,
                  uuid: safecoinTxs.txData._uuid,
                  api: safecoinTxs.txData.api,
                  tokenId: safecoinTxs.txData.tokenId,
                  timeout: Math.trunc(Math.max(Math.random() * safecoinTxs.length * 500, 200)),
                }),
              });
            });
            resolve(allTxs);
          } else {
            resolve([]);
          }
        })
        .catch(reject);
    });
  }

  async parseTxs(data: {
    txs: TransactionAPI;
    address: string;
    uuid: string;
    ticker: string;
    api: string;
    timeout: number;
  }): Promise<Transaction[]> {
    return new Promise(async resolve => {
      setTimeout(async () => {
        try {
          let txs: Transaction[] = [];
          const apiUrl = this.backendService.getSafeApi(data);
          const connection = this.backendService.safecoin.getConnection({ api: apiUrl });
          const signatures = data.txs.safecoinTxs.map(t => t.signature);
          let confirmedTransactions = await connection.getParsedConfirmedTransactions(signatures);
          confirmedTransactions = confirmedTransactions.filter(e => !!e);
          confirmedTransactions.forEach(tx => {
            const meta = tx.meta;
            const trans = tx.transaction;
            let amount = 0;
            if (meta) {
              amount = meta.preBalances[0] - meta.postBalances[0];
              if(amount > 0){
                amount -= meta.fee;
              }
            }
            const sender = trans.message.accountKeys[0].pubkey.toBase58();
            let receiver = trans.message.accountKeys[1].pubkey.toBase58();
            if (
              trans.message.accountKeys[1].pubkey.toString() ==
              safecoinWeb3.SystemProgram.programId.toString()
            ) {
              receiver = sender;
            }

            let action: TxType = TxType.UNKNOWN;
            if (sender === data.address && receiver === data.address) {
              action = TxType.MOVE;
            } else if (sender === data.address && receiver !== data.address) {
              action = TxType.SEND;
            } else if (sender !== data.address && receiver === data.address) {
              action = TxType.RECEIVE;
            }

            const t: Transaction = {
              _uuid: data.uuid,
              type: action,
              ticker: data.ticker,
              address: action == TxType.SEND ? receiver : sender,
              amount: amount,
              hash: tx.transaction.signatures[0],
              unix: tx.blockTime,
              confirmed: true,
              date: new Date(tx.blockTime * 1000).toLocaleString('ja-JP', {
                hour12: false,
              }),
              block: tx.slot,
            };
            if (txs.findIndex(e => e.hash === t.hash) === -1) txs.push(t);
          });
          txs = txs.reverse();
          resolve(txs);
        } catch (err) {
          console.log(err);
          var timeout = 0;
          if (err.message.includes('429')) {
            const split = err.message.split(['Retrying after', 'ms']);
            console.log(split);
            timeout =
              split.length >= 2 ? Math.trunc(parseFloat(split[split.length - 2]) * 1.1) : 10000;
          } else {
            timeout = Math.trunc(Math.random() * 3000);
          }
          setTimeout(() => {
            this.parseTxs(data).then(resolve);
          }, timeout);
        }
      }, data.timeout);
    });
  }

  private _parseInstruction(e: safecoinWeb3.ParsedInstruction) {
    let amount = 0;
    let sender = '';
    let receiver = '';
    switch (e.parsed?.type) {
      case 'transferChecked':
        amount = parseInt(e.parsed.info.tokenAmount.amount);
        sender = e.parsed.info.source;
        receiver = e.parsed.info.destination;
        break;
      case 'transfer':
        amount = parseInt(e.parsed.info.amount);
        sender = e.parsed.info.source;
        receiver = e.parsed.info.destination;
        break;
      case 'create':
        amount = 0;
        sender = e.parsed.info.source;
        receiver = e.parsed.info.account;
        break;
      default:
        break;
    }
    return { amount, sender, receiver };
  }

  async parseTxsToken(data: {
    txs: TransactionAPI;
    addresses: string[];
    uuid: string;
    ticker: string;
    api: string;
    tokenId: string;
    timeout: number;
  }): Promise<Transaction[]> {
    return new Promise(async resolve => {
      setTimeout(async () => {
        try {
          const txs: Transaction[] = [];
          const apiUrl = this.backendService.getSafeApi(data);
          const connection = this.backendService.safecoin.getConnection({ api: apiUrl });
          const signatures = data.txs.safecoinTxs.map(t => t.signature);
          const confirmedTransactions = await connection.getParsedConfirmedTransactions(signatures);
          confirmedTransactions.forEach(tx => {
            if (tx) {
              const signature = tx.transaction.signatures[0];
              const meta = tx.meta;
              const trans = tx.transaction;
              let action: TxType = TxType.UNKNOWN;
              var parsed;
              // console.log(meta);
              trans.message.instructions.some((e: safecoinWeb3.ParsedInstruction) => {
                parsed = this._parseInstruction(e);
                if (parsed.sender === '' || parsed.receiver === '') {
                  parsed = {
                    amount: 0,
                    receiver: '',
                    sender: '',
                  };
                  const innerInstructions = meta.innerInstructions;
                  var currParsed;
                  var oldParsed;
                  innerInstructions.some((e: any) => {
                    const instructions = e.instructions;
                    if (instructions) {
                      instructions.some((ee: safecoinWeb3.ParsedInstruction) => {
                        currParsed = this._parseInstruction(ee);
                        if (data.addresses.find(
                          e => e.toString() === (currParsed.sender).toString(),
                        )) {
                          parsed.amount -= currParsed.amount;
                          if (parsed.amount < 0) {
                            parsed.sender = currParsed.sender;
                            parsed.receiver = currParsed.receiver;
                          }
                        }
                        else if (data.addresses.find(
                          e => e.toString() === (currParsed.receiver).toString(),
                        )) {
                          parsed.amount += currParsed.amount;
                          if (parsed.amount > 0) {
                            parsed.sender = currParsed.sender;
                            parsed.receiver = currParsed.receiver;
                          }
                        }
                      });
                    }
                  });
                }
              });
              const isSender = parsed.amount <= 0;
              const isReceiver = parsed.amount >= 0;
              if (isSender && isReceiver) {
                action = TxType.MOVE;
              } else if (isSender && !isReceiver) {
                action = TxType.SEND;
              } else if (!isSender && isReceiver) {
                action = TxType.RECEIVE;
              }
              const t: Transaction = {
                _uuid: data.uuid,
                type: action,
                ticker: data.ticker,
                address:
                  action == TxType.RECEIVE ? parsed.sender : parsed.receiver || data.addresses[0],
                amount: Math.abs(parsed.amount) || 0,
                hash: signature,
                unix: tx.blockTime,
                confirmed: true,
                date: new Date(tx.blockTime * 1000).toLocaleString('ja-JP', {
                  hour12: false,
                }),
                block: tx.slot,
              };
              if (txs.findIndex(e => e.hash === t.hash) === -1) txs.push(t);
            }
          });
          resolve(txs);
        } catch (err) {
          var timeout = 0;
          if (err.message.includes('429')) {
            const split = err.message.split(['Retrying after', 'ms']);
            console.log(split);
            timeout =
              split.length >= 2 ? Math.trunc(parseFloat(split[split.length - 2]) * 1.1) : 10000;
          } else {
            timeout = Math.trunc(Math.random() * 3000);
          }
          setTimeout(() => {
            this.parseTxsToken(data).then(resolve);
          }, timeout);
        }
      }, data.timeout);
    });
  }

  async parseTxsToken2(data: {
    txs: safecoinWeb3.ParsedConfirmedTransaction[];
    address: string[];
    uuid: string;
    ticker: string;
    api: string;
    tokenId: string;
    timeout: number;
  }): Promise<Transaction[]> {
    return new Promise(async resolve => {
      try {
        const txs: Transaction[] = [];
        data.txs.forEach(tx => {
          if (tx) {
            const signature = tx.transaction.signatures[0];
            const meta = tx.meta;
            const trans = tx.transaction;
            let action: TxType = TxType.UNKNOWN;
            var parsed;
            // console.log(meta);
            trans.message.instructions.some((e: safecoinWeb3.ParsedInstruction) => {
              parsed = this._parseInstruction(e);
              if (parsed.sender === '' || parsed.receiver === '') {
                const innerInstructions = meta.innerInstructions;
                innerInstructions.some((e: any) => {
                  const instructions = e.instructions;
                  if (instructions) {
                    instructions.some((ee: safecoinWeb3.ParsedInstruction) => {
                      parsed = this._parseInstruction(ee);
                      if (parsed.sender !== '' || parsed.receiver !== '') {
                        return true;
                      }
                    });
                  }
                  if (parsed.sender !== '' || parsed.receiver !== '') {
                    return true;
                  }
                });
              }
            });
            const isSender = !!data.address.find(
              e => e.toString() === (parsed.sender || data.address[0]).toString(),
            );
            const isReceiver = !!data.address.find(
              e => e.toString() === (parsed.receiver || data.address[0]).toString(),
            );
            if (isSender && isReceiver) {
              action = TxType.MOVE;
            } else if (isSender && !isReceiver) {
              action = TxType.SEND;
            } else if (!isSender && isReceiver) {
              action = TxType.RECEIVE;
            }
            const t: Transaction = {
              _uuid: data.uuid,
              type: action,
              ticker: data.ticker,
              address:
                action == TxType.RECEIVE ? parsed.sender : parsed.receiver || data.address[0],
              amount: parsed.amount || 0,
              hash: signature,
              unix: tx.blockTime,
              confirmed: true,
              date: new Date(tx.blockTime * 1000).toLocaleString('ja-JP', {
                hour12: false,
              }),
              block: tx.slot,
            };
            if (txs.findIndex(e => e.hash === t.hash) === -1) txs.push(t);
          }
        });
        resolve(txs);
      } catch (err) {
        resolve([]);
      }
    });
  }
}
