import { Injectable } from '@angular/core';
import { BalBase } from './balancebase';
import * as safecoinWeb3 from '@safecoin/web3.js';
import { environment } from 'src/environments/environment';
import { NetworkService } from '../connection/network.service';
import { mnemonicToSeedSync } from 'bip39';
import { BackendService } from '../blockchain/backend.service';
import { AddressType } from '@simplio/backend/interface/data';
@Injectable({
  providedIn: 'root',
})
export class BalSafecoinService extends BalBase {
  constructor(private backendService: BackendService, private networkService: NetworkService) {
    super('Balweb3Service');
  }

  init() {
    if (!environment.production) {
    }
  }

  private _getBalance(data: {
    address: string;
    api: string;
    count: number;
    important?: boolean;
  }): Promise<number> {
    const publickey = new safecoinWeb3.PublicKey(data.address);
    const connection = this.backendService.safecoin.getConnection(data);
    return connection
      .getBalance(publickey)
      .then(bal => bal)
      .catch(err => {
        if (data.count < 5) {
          data.count += 1;
          console.log('Count retry bal safe', data.count);
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

  private async _getTokenBalance(data: {
    seeds: string;
    contractAddress: string;
    api: string;
    count: 0;
    important?: boolean;
    addressType: AddressType
  }): Promise<number> {
    const connection = this.backendService.safecoin.getConnection(data);
    const publickey = await this.backendService.safecoin.getAddress({
      mnemo: data.seeds,
    });
    const myMint = new safecoinWeb3.PublicKey(data.contractAddress);
    let balance = 0;
    return connection
      .getParsedTokenAccountsByOwner(new safecoinWeb3.PublicKey(publickey.address), { mint: myMint })
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
          console.log('Count retry bal safe token', data.count);
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

  getTokenBalance(data: { seeds: string; contractAddress: string; api: string; addressType: AddressType }): Promise<number> {
    return this._getTokenBalance({
      seeds: data.seeds,
      contractAddress: data.contractAddress,
      api: data.api,
      count: 0,
      important: true,
      addressType: data.addressType
    });
  }
}
