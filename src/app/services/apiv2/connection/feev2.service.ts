import { Injectable } from '@angular/core';
import { AddrUtxo, FeeName, FeeResponsev2, Rate, WalletType } from 'src/app/interface/data';
import { environment } from 'src/environments/environment';
import { coinNames } from '@simplio/backend/api/utils/coins';
import { UtilsService } from '../../utils.service';
import { BackendService } from '../blockchain/backend.service';

import { NetworkService } from './network.service';

@Injectable({
  providedIn: 'root',
})
export class Feev2Service {
  fee: FeeResponsev2;
  feev2Url = 'https://data.simplio.io/feev2.json';
  blockChainFee = 'https://api.blockchain.info/mempool/fees';

  constructor(private networkService: NetworkService, private backendService: BackendService) {
    this.refresh();
  }

  refresh() {
    this.getFee().then(res => {
      this.fee = res;
    });
  }

  getFee(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.networkService
        .get(environment.DATA + 'feesv2')
        .then(resolve)
        .catch(err => {
          this.networkService.get(environment.FEE_URL).then(resolve).catch(reject);
        });
    });
  }

  getBtcFee(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.networkService
        .get(this.blockChainFee)
        .then(resolve)
        .catch(err => {
          console.log(err);
          reject(null);
        });
    });
  }

  getRatio(feeLevel: FeeName) {
    switch (feeLevel) {
      case FeeName.URGENT:
        return 1.25;
      case FeeName.PRIORITY:
        return 1.11;
      case FeeName.NORMAL:
      default:
        return 1;
      case FeeName.ECONOMY:
        return 0.9;
      case FeeName.SUPER_ECONOMY:
        return 0.75;
    }
  }

  getFeePrice(ticker: string, type: WalletType, feeLevel: FeeName): Promise<number> {
    let price = 0;
    if (UtilsService.isCoin(type)) {
      if (ticker === coinNames.BTC) {
        return this.getBtcFee().then(res => Math.trunc(res.priority * this.getRatio(feeLevel)));
      } else {
        price = this.fee[ticker.toLowerCase()]?.value || 10000;
        return Promise.resolve(Math.trunc(price * this.getRatio(feeLevel)));
      }
    } else if (UtilsService.isErcCoin) {
      return this.backendService.web3
        .getGasPrice(type)
        .then(res => Math.trunc(res * this.getRatio(feeLevel)));
    } else {
      console.log('Not supported fee');
      return Promise.resolve(0);
    }
  }

  getMinFee(ticker: string) {
    return this.fee[ticker.toLowerCase()]?.minFee || 0;
  }

  estimatedFee(data: {
    ticker: string;
    type: WalletType;
    ismax: boolean;
    feePrice: number;
    amount: number;
    address: string;
    from: string;
    utxos: AddrUtxo[]; // specify for bitcore lib
    minFee: number;
    abi: string; // for bsc and erc tokens
    contractAddress: string; // for tokens
    rates?: Rate[];
    // for SOL & SOL tokens tokens
    api: string;
    signature: number;
    tokenData?: any;
  }): Promise<any> {
    return this.backendService.estimatedFee(data);
  }
}
