import { Injectable } from '@angular/core';
import { WalletType } from 'src/app/interface/data';
import { ExplorerType } from 'src/app/interface/explorer';
import { NetworkService } from './network.service';

@Injectable({
  providedIn: 'root',
})
export class AbiService {
  constructor(private networkService: NetworkService) {
    setTimeout(() => {
      this.getAbi({
        ticker: '',
        type: WalletType.ETH_TOKEN,
        contractAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      });
    }, 10000);
  }

  getAbi(data: { ticker: string; type: WalletType; contractAddress: string }): Promise<any> {
    // const explorer = this.networkService.getCoinExplorer(data.ticker, data.type, ExplorerType.UNKNOWN);
    // const url = explorer.abi.replace('<address>', data.contractAddress);
    // return this.networkService.get(url).then((res: any) => {
    //   // console.log("contract", res.result);
    //   return res.result;
    // });
    const abi = `[
      {
        "constant": false,
        "inputs": [
          {
            "name": "_to",
            "type": "address"
          },
          {
            "name": "_value",
            "type": "uint256"
          }
        ],
        "name": "transfer",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "who",
            "type": "address"
          }
        ],
        "name": "balanceOf",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "decimals",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      }
    ]`;
    return Promise.resolve(abi);
  }
}
