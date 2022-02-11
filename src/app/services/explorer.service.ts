import { Injectable } from '@angular/core';
import { Params } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { UtilsService } from './utils.service';
import { Explorer, ExplorerType, NetworkFallback } from 'src/app/interface/explorer';
import { AddrUtxo, ExplorerTransactionData } from 'src/app/interface/data';
import { environment } from '../../environments/environment';
import { PlatformProvider } from '../providers/platform/platform';
import { NetworkService } from './apiv2/connection/network.service';

@Injectable({
  providedIn: 'root',
})
export class ExplorerService {
  networks: NetworkFallback;
  networksData = new BehaviorSubject<NetworkFallback>(null);

  /* tslint:disable:semicolon */
  instant = (type, self, explorer, address) => {
    switch (type) {
      case ExplorerType.INSIGHT:
      default:
        return self._getBalanceV1(explorer, address);
      case ExplorerType.BLOCKBOOK:
        return self._getBalanceV2(explorer, address);
    }
  };
  /* tslint:enable:semicolon */
  constructor(
    private utilsService: UtilsService,
    private platformProvider: PlatformProvider,
    private networkService: NetworkService,
  ) {}

  /**
   *
   * explorer
   * params
   * url
   */
  getUTXO(explorer: Explorer, params: Params, url?: string): Promise<AddrUtxo[]> {
    switch (explorer.type) {
      case ExplorerType.INSIGHT:
      default:
        const extend = '/addrs/utxo';
        return this._postData<AddrUtxo[]>(explorer, extend, params, url);
      case ExplorerType.BLOCKBOOK:
        return this._getUTXOV2(explorer, params, url);
    }
  }

  /**
   *
   * explorer
   * params
   * url
   *
   */
  broadcastTx(explorer: Explorer, rawtx: string, url?: string): Promise<ExplorerTransactionData> {
    switch (explorer.type) {
      case ExplorerType.INSIGHT:
      default:
        const extend = '/tx/send';
        return this._postData<ExplorerTransactionData>(explorer, extend, { rawtx }, url);
      case ExplorerType.BLOCKBOOK:
        return this._broadcastTxV2(explorer, rawtx, url);
    }
  }

  /**
   *  Getting data
   *  POST
   *  explorer
   *  extend
   *  params
   *  url
   */
  private _postData<T>(explorer: Explorer, extend: string, params: any, url?: string): Promise<T> {
    const URL = url ? url : explorer.api + extend;
    const rUrl = this.platformProvider.isCordova ? URL : environment.CORS_ANYWHERE + URL;
    return this.networkService.post<T>(rUrl, params);
  }

  /**
   *  Getting data
   *  @api GET
   *  explorer
   *  extend
   *  params
   *  url
   */
  private _getData<T>(explorer: Explorer, extend: string, url?: string): Promise<T> {
    const URL = url ? url : explorer.api + extend;
    const rUrl = this.platformProvider.isCordova ? URL : environment.CORS_ANYWHERE + URL;
    const splt = extend.split('/');
    return this.networkService.get(rUrl).then(res => {
      const d = res as any;
      d.address = splt[splt.length - 1].split('?')[0];
      return res as T;
    });
  }

  /**
   *
   * explorer
   * params
   * url
   */
  private async _getUTXOV2(explorer: Explorer, params: Params, url?: string): Promise<AddrUtxo[]> {
    return new Promise((resolve, reject) => {
      const addrs = params.addrs.split(',');
      const promisesToMake = [];
      addrs.forEach(addr => {
        promisesToMake.push(
          this._getData<{ addr: string; data: any }>(explorer, '/v2/utxo/' + addr, url),
        );
      });
      const utxos: AddrUtxo[] = [];
      Promise.all(promisesToMake)
        .then(res => {
          for (const ele of res) {
            ele.forEach(e => {
              utxos.push({
                address: ele.address,
                confirmations: e.confirmations,
                height: 0,
                satoshis: Number(e.value),
                txid: e.txid,
                vout: e.vout,
              });
            });
          }
          resolve(utxos);
        })
        .catch(reject);
    });
  }

  /**
   *
   * explorer
   * params
   * url
   */
  private _broadcastTxV2(explorer: Explorer, rawtx: string, url?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const URL = url ? url : explorer.api + '/v2/sendtx/' + rawtx;
      const rUrl = this.platformProvider.isCordova ? URL : environment.CORS_ANYWHERE + URL;
      this.networkService
        .postCustom(rUrl, rawtx, 'text/html')
        .then((res: any) => {
          resolve({
            status: 200,
            txid: res.result,
          });
        })
        .catch(err => {
          reject(err);
        });
    });
  }
}
