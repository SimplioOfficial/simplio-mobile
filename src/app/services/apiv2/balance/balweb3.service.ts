import { Injectable } from '@angular/core';
import { WalletType } from 'src/app/interface/data';
import { Explorer } from 'src/app/interface/explorer';
import { environment } from 'src/environments/environment';
import { NetworkService } from '../connection/network.service';
import { BalBase } from './balancebase';
import { AbiItem } from 'web3-utils';
import { getAbi } from '../utils';
import { BlockchainService } from '../blockchain/blockchain.service';
@Injectable({
  providedIn: 'root',
})
export class Balweb3Service extends BalBase {
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
      //     address: '0x112728EeC4ebB06b3057FC693C9Dc68622B78696',
      //     type: WalletType.ETH
      //   })
      //     .then(res => console.log('test getbalance eth', res))
      //     .catch(err => console.log(err));
      //   // this.getTokenBalance({
      //   //   address: '0x3308a93aeaa3fa657edb744e0c247cf3e49836e1',
      //   //   type: WalletType.ETH_TOKEN,
      //   //   contractAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      //   //   abi: coins.find(e => e.ticker === 'USDT').abi
      //   // })
      //   //   .then(res => console.log('test getbalance usdt', res))
      //   //   .catch(err => console.log(err));
      // }, 1000);
    }
  }

  getBalance(data: { address: string; type: WalletType }): Promise<number> {
    return this.blockchainService.web3
      .getLib(data.type)
      .eth.getBalance(data.address)
      .then(balance => parseInt(balance));
  }

  private async _getTokenBalanceScan(data: {
    address: string;
    contractAddress;
    explorers: Explorer[];
    uuid: string;
    ticker: string;
    retry?: number;
  }): Promise<number> {
    // return new Promise((resolve, reject) => {
    try {
      let url = data.explorers[0].api_balance
        .replace('<address>', data.address)
        .replace('<contractaddress>', data.contractAddress);

      return this.networkService
        .get(url)
        .then((res: any) => {
          return parseInt(res.result);
        })
        .catch(err => {
          if (!data.retry) {
            data.retry = 0;
          }
          ++data.retry;
          if (data.retry >= 4) {
            return 0;
          } else {
            return new Promise((resolve, reject) =>
              setTimeout(() => {
                console.log('Count retry balance for', data.ticker, data.uuid, data.retry);
                return this._getTokenBalanceScan(data).then(resolve).catch(reject);
              }, Math.trunc(Math.random() * 3000)),
            );
          }
        });
    } catch (_) {
      return 0;
    }
  }

  async getTokenBalance(data: {
    address: string;
    type: WalletType;
    contractAddress: string;
    abi: string;
    explorers: Explorer[];
    uuid: string;
    ticker: string;
  }): Promise<number> {
    const lib = this.blockchainService.web3.getLib(data.type);
    const contract = new lib.eth.Contract(getAbi(data.abi), data.contractAddress);
    try {
      const balance = await contract.methods.balanceOf(data.address).call();
      return parseInt(balance);
    } catch {
      return this._getTokenBalanceScan(data);
    }
  }
}
