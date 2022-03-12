import { Injectable } from '@angular/core';
import { BalBase } from './balancebase';
import * as solanaWeb3 from '@solana/web3.js';
import { environment } from 'src/environments/environment';
import { NetworkService } from '../connection/network.service';
import { mnemonicToSeedSync } from 'bip39';
import { BlockchainService } from '../blockchain/blockchain.service';
import { AddressType } from '@simplio/backend/interface/data';
@Injectable({
  providedIn: 'root',
})
export class BalsolanaService extends BalBase {
  constructor(
    private blockchainService: BlockchainService,
    private networkService: NetworkService,
  ) {
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
    const apiUrl = this.blockchainService.getSolApi(data);
    const connection = this.blockchainService.solana.getConnection({ api: apiUrl });
    return connection
      .getBalance(publickey)
      .then(bal => bal)
      .catch(err => {
        if (data.count < 5) {
          data.count += 1;
          console.log('Count retry bal sol', data.count);
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
    addressType: AddressType;
  }): Promise<number> {
    const apiUrl = this.blockchainService.getSolApi(data);
    const connection = this.blockchainService.solana.getConnection({ api: apiUrl });
    const mainPublickey = await this.blockchainService.solana.getAddress({
      mnemo: data.seeds,
      addressType: data.addressType,
    });
    const publickey = await this.blockchainService.solana.getTokenAddress({
      address: mainPublickey.address.toString(),
      contractAddress: data.contractAddress,
      api: data.api,
    });
    return connection
      .getParsedAccountInfo(publickey)
      .then(res => {
        return (res.value.data as any).parsed.info.tokenAmount.amount;
      })
      .catch(_ => {
        if (data.count < 5) {
          data.count += 1;
          console.log('Count retry bal sol token', data.count);
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

  getTokenBalance(data: {
    seeds: string;
    contractAddress: string;
    api: string;
    addressType: AddressType;
  }): Promise<number> {
    return this._getTokenBalance({
      seeds: data.seeds,
      contractAddress: data.contractAddress,
      api: data.api,
      count: 0,
      important: true,
      addressType: data.addressType,
    });
  }
}
