import { Injectable } from '@angular/core';
import { BalBase } from './balancebase';
import * as solanaWeb3 from '@solana/web3.js';
import { environment } from 'src/environments/environment';
import { NetworkService } from '../connection/network.service';
import { mnemonicToSeedSync } from 'bip39';
import { BackendService } from '../blockchain/backend.service';
@Injectable({
  providedIn: 'root',
})
export class BalsolanaService extends BalBase {
  constructor(private backendService: BackendService, private networkService: NetworkService) {
    super('Balweb3Service');
  }

  init() {
    if (!environment.production) {
      // setTimeout(() => {
      //   this.getBalance({
      //     address: '4YGgmwyqztpJeAi3pzHQ4Gf9cWrMHCjZaWeWoCK6zz6X',
      //     api: solanaWeb3.clusterApiUrl('devnet')
      //   })
      //     .then(res => console.log('test getbalance solana', res))
      //     .catch(err => console.log(err));
      // });
    }
  }

  private _getBalance(data: {
    address: string;
    api: string;
    count: number;
    important?: boolean;
  }): Promise<number> {
    const publickey = new solanaWeb3.PublicKey(data.address);
    const connection = this.backendService.solana.getConnection(data);
    return connection
      .getBalance(publickey)
      .then(bal => bal)
      .catch(err => {
        if (data.count < 5) {
          data.count += 1;
          console.log('Country retry bal sol', data.count);
          return new Promise((resolve, reject) =>
            setTimeout(() => {
              return this._getBalance(data).then(resolve).catch(reject);
            }, Math.trunc(Math.random() * 3000)),
          );
        } else {
          return 0;
        }
      });
  }

  getBalance(data: { address: string; api: string }): Promise<number> {
    return this._getBalance({ address: data.address, api: data.api, count: 0, important: true });
  }

  private _getTokenBalance(data: {
    seeds: string;
    contractAddress: string;
    api: string;
    count: 0;
    important?: boolean;
  }): Promise<number> {
    const connection = this.backendService.solana.getConnection(data);
    const seed = mnemonicToSeedSync(data.seeds);
    const myaccount = solanaWeb3.Keypair.fromSeed(seed.slice(0, 32));
    const publickey = myaccount.publicKey;
    const myMint = new solanaWeb3.PublicKey(data.contractAddress);
    let balance = 0;
    return connection
      .getParsedTokenAccountsByOwner(publickey, { mint: myMint })
      .then(res => {
        if (res.value.length > 0) {
          const accounts = res.value;
          accounts.forEach(element => {
            balance += Number(element.account.data.parsed.info.tokenAmount.amount);
          });
        }
        return balance;
      })
      .catch(_ => {
        if (data.count < 5) {
          data.count += 1;
          console.log('Country retry bal sol token', data.count);
          return new Promise((resolve, reject) =>
            setTimeout(() => {
              return this._getTokenBalance(data).then(resolve).catch(reject);
            }, Math.trunc(Math.random() * 3000)),
          );
        } else {
          return 0;
        }
      });
  }

  getTokenBalance(data: { seeds: string; contractAddress: string; api: string }): Promise<number> {
    return this._getTokenBalance({
      seeds: data.seeds,
      contractAddress: data.contractAddress,
      api: data.api,
      count: 0,
      important: true,
    });
  }
}
