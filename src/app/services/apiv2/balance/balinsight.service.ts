import { Injectable } from '@angular/core';
import { AddrBalance, WalletType } from 'src/app/interface/data';
import { Explorer, ExplorerType } from 'src/app/interface/explorer';
import { environment } from 'src/environments/environment';
import { NetworkService } from '../connection/network.service';
import { BalBase } from './balancebase';

@Injectable({
  providedIn: 'root',
})
export class BalinsightService extends BalBase {
  constructor(private networkService: NetworkService) {
    super('BalinsightService');
  }

  init() {
    if (!environment.production) {
    }
  }

  /**
   *
   * explorer
   * address
   */
  private _getAddrBalance(data: { explorers: Explorer[]; address: string }): Promise<AddrBalance> {
    return new Promise((resolve, reject) => {
      let explorers = [...data.explorers.sort((a, b) => b.priority - a.priority)];
      if (explorers.length === 0) {
        console.log('Cannot get balance for', data.address);
        reject({
          addrStr: data.address,
          balanceSat: 0,
        });
      } else {
        const ex = explorers.pop();
        getBalance(this, ex, data.address);
      }
      function getBalance(self, ex, address) {
        const URL = ex.api + '/addr/' + address + '?noTxList=1';
        return self.networkService
          .get(URL)
          .then(data => {
            resolve(data as AddrBalance);
          })
          .catch(err => {
            if (ex.length > 0) {
              const ex = explorers.pop();
              console.log('Get balance switch to', ex.api);
              getBalance(self, ex, address);
            } else {
              reject({
                addrStr: address,
                balanceSat: 0,
              });
            }
          });
      }
    });
  }

  getBalance(data: { addresses: string[]; explorers: Explorer[] }): Promise<number> {
    return new Promise((resolve, reject) => {
      const promisesToMake = [];
      data.addresses.forEach(e =>
        promisesToMake.push(
          this._getAddrBalance({
            explorers: data.explorers.sort((a, b) => b.priority - a.priority),
            address: e,
          }),
        ),
      );
      const results = Promise.all(promisesToMake);
      results
        .then(res => {
          return resolve(
            res.reduce((a, b) => {
              return a + b.balanceSat;
            }, 0),
          );
        })
        .catch(err => reject(err));
    });
  }
}
