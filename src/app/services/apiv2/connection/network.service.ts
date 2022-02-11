import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from '@polkadot/x-rxjs';
import { cloneDeep } from 'lodash';
import { WalletType } from 'src/app/interface/data';
import { Explorer, ExplorerType, NetworkFallback } from 'src/app/interface/explorer';
import { AuthenticationProvider } from 'src/app/providers/data/authentication.provider';
import { PlatformProvider } from 'src/app/providers/platform/platform';
import { environment } from 'src/environments/environment';
import { HttpService } from '../../http.service';
import { IoService } from '../../io.service';

@Injectable({ providedIn: 'root' })
export class NetworkService {
  networks: NetworkFallback;
  networksData = new BehaviorSubject<NetworkFallback>(null);

  constructor(
    private httpService: HttpService,
    private platformProvider: PlatformProvider,
    private ioService: IoService,
  ) {
    this.init();
  }

  async init() {
    return this.getNetworks()
      .then(res => {
        if (res) {
          this.networks = res;
          this.networksData.next(res);
        }
        return true;
      })
      .catch(_ => false);
  }

  getNetworks(): Promise<NetworkFallback> {
    return new Promise<any>((resolve, reject) => {
      if (!this.networks) {
        this.get(
          environment.production
            ? environment.DATA + 'explorersv2'
            : environment.DATA + 'explorersbetav2',
        )
          .then((res: any) => {
            const data = JSON.parse(this.ioService.decrypt(res.result, environment.DATA_PASSWORD));
            resolve(data as NetworkFallback);
          })
          .catch(err => {
            this.get(environment.EXPLORER_URL)
              .then(res => {
                resolve(res as NetworkFallback);
              })
              .catch(err => {
                setTimeout(() => {
                  this.getNetworks();
                }, 5000);
                reject(err);
              });
          });
      } else {
        resolve(this.networks);
      }
    });
  }

  getCoinExplorers(ticker: string, type: WalletType): Explorer[] {
    if (!this.networks) {
      this.init();
    }
    if (this.networks && ticker && this.networks[ticker.toLowerCase()]) {
      return cloneDeep(this.networks[ticker.toLowerCase()]);
    }
    if (this.networks && type && this.networks[type.toString()]) {
      return cloneDeep(this.networks[type.toString()]);
    }
    // console.log(this.networks ? 'Cannot find ' + coin : 'Network is not available');
    return [];
  }

  getCoinExplorer(ticker: string, type: WalletType, explorerType: ExplorerType): Explorer {
    if (!this.networks) {
      this.getNetworks().then(res => (this.networks = res));
    }
    switch (type) {
      case WalletType.BITCORE_CUSTOM:
      case WalletType.BITCORE_ZCASHY:
      case WalletType.BITCORE_LIB:
        if (
          this.networks &&
          ticker &&
          this.networks[ticker.toLowerCase()] &&
          explorerType !== ExplorerType.UNKNOWN
        ) {
          return this.networks[ticker.toLowerCase()].find(e => e.type === explorerType);
        }
        if (this.networks && ticker && this.networks[ticker.toLowerCase()]) {
          return this.networks[ticker.toLowerCase()][0];
        }
        break;
      default:
        if (
          this.networks &&
          type &&
          this.networks[type.toString()] &&
          explorerType !== ExplorerType.UNKNOWN
        ) {
          return this.networks[type.toString()].find(e => e.type === explorerType);
        }
        if (this.networks && type && this.networks[type.toString()]) {
          return this.networks[type.toString()][0];
        }
    }
    // console.log(this.networks ? 'Cannot find ' + coin : 'Network is not available');
    return undefined;
  }

  private _postData<T>(data: {
    explorer: Explorer;
    extend: string;
    params: any;
    url?: string;
    count: number;
    timeout?: number;
  }): Promise<T> {
    return new Promise((resolve, reject) => {
      const URL = data.url ? data.url : data.explorer.api + data.extend;
      const rUrl = this.platformProvider.isCordova ? URL : environment.CORS_ANYWHERE + URL;
      const headers = this.httpService.getHttpHeaders();
      const serializer = 'json';
      this.httpService.setDataSerializer(serializer);
      return this.httpService
        .post<T>(rUrl, data.params, { headers })
        .then(resolve)
        .catch(err => {
          if (data.count > 5) {
            reject(err);
          } else {
            setTimeout(() => {
              data.count++;
              this._postData(data).then(resolve).catch(reject);
            }, data.timeout ?? 3000);
          }
        });
    });
  }

  /**
   *  Getting data
   *  POST
   *  explorer
   *  extend
   *  params
   *  url
   */
  postData<T>(
    explorer: Explorer,
    extend: string,
    params: any,
    url?: string,
    timeout?: number,
  ): Promise<T> {
    return this._postData<T>({
      explorer,
      params,
      extend,
      url,
      timeout,
      count: 0,
    });
  }

  /**
   *  Getting data
   *  @api GET
   *  explorer
   *  extend
   *  params
   *  url
   */

  private _getData<T>(data: {
    explorer: Explorer;
    extend: string;
    url?: string;
    count: number;
    timeout?: number;
  }): Promise<T> {
    return new Promise((resolve, reject) => {
      const URL = data.url ? data.url : data.explorer.api + data.extend;
      const rUrl = this.platformProvider.isCordova ? URL : environment.CORS_ANYWHERE + URL;
      const headers = this.httpService.getHttpHeaders();
      this.httpService.setDataSerializer('json');
      const splt = data.extend.split('/');
      return this.httpService
        .get(rUrl, { headers })
        .then(res => {
          const d = res as any;
          d.address = splt[splt.length - 1].split('?')[0];
          resolve(res as T);
        })
        .catch(err => {
          if (data.count > 5) {
            reject(err);
          } else {
            setTimeout(() => {
              data.count++;
              this._getData(data).then(resolve).catch(reject);
            }, data.timeout ?? 3000);
          }
        });
    });
  }

  getData<T>(explorer: Explorer, extend: string, url?: string, timeout?: number): Promise<T> {
    return this._getData<T>({
      explorer,
      extend,
      url,
      timeout,
      count: 0,
    });
  }

  private _get<T>(url: string, headers, count: number, timeout?: number): Promise<T> {
    return new Promise((resolve, reject) => {
      this.httpService
        .get(url, { headers })
        .then(resolve)
        .catch(err => {
          if (count > 5) {
            reject(err);
          } else {
            setTimeout(() => {
              count++;
              this._get(url, count, timeout).then(resolve).catch(reject);
            }, timeout ?? 3000);
          }
        });
    });
  }

  get<T>(url: string): Promise<T> {
    const rUrl = this.platformProvider.isCordova ? url : environment.CORS_ANYWHERE + url;
    const headers = this.httpService.getHttpHeaders();
    return this._get(rUrl, headers, 0);
  }

  private _post<T>(url: string, params, headers, count: number, timeout?: number): Promise<T> {
    return new Promise((resolve, reject) => {
      this.httpService
        .post<T>(url, params, { headers })
        .then(resolve)
        .catch(err => {
          if (count > 5) {
            reject(err);
          } else {
            setTimeout(() => {
              count++;
              this._post(url, params, headers, count, timeout).then(resolve).catch(reject);
            }, timeout ?? 3000);
          }
        });
    });
  }

  post<T>(url: string, params): Promise<T> {
    const rUrl = this.platformProvider.isCordova ? url : environment.CORS_ANYWHERE + url;
    const headers = this.httpService.getHttpHeaders();
    return this._post<T>(rUrl, params, { headers }, 0);
  }

  private _postCustom<T>(url: string, params, option, count: number, timeout?: number): Promise<T> {
    return new Promise((resolve, reject) => {
      return this.httpService
        .post<T>(url, params, option)
        .then(res => {
          this.httpService.setDataSerializer('json');
          resolve(res);
        })
        .catch(err => {
          if (count > 5) {
            reject(err);
          } else {
            setTimeout(() => {
              count++;
              this._postCustom(url, params, option, count, timeout).then(resolve).catch(reject);
            }, timeout ?? 3000);
          }
        });
    });
  }

  put(url: string, params): Promise<void> {
    const rUrl = this.platformProvider.isCordova ? url : environment.CORS_ANYWHERE + url;
    const headers = this.httpService.getHttpHeaders();
    return this.httpService.put(rUrl, params, { headers });
  }

  delete(url: string, params?): Promise<any> {
    const rUrl = this.platformProvider.isCordova ? url : environment.CORS_ANYWHERE + url;
    const headers = this.httpService.getHttpHeaders();
    return this.httpService.delete(rUrl, { headers, params });
  }

  postCustom<T>(url: string, params, contentType): Promise<T> {
    const rUrl = this.platformProvider.isCordova ? url : environment.CORS_ANYWHERE + url;
    const headers = this.httpService.getHttpHeaders(contentType);
    return this._postCustom(rUrl, params, { headers }, 0);
  }
}
