import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { SupportedFiat, Wallet } from 'src/app/interface/data';
import {
  AddAddressesRequestBody,
  SwapPair,
  SwapReportPage,
  SwapReportRequestParams,
  SwapType,
} from 'src/app/interface/swap';
import { PlatformProvider } from 'src/app/providers/platform/platform';
import { HeadersService } from 'src/app/services/headers.service';
import { environment } from 'src/environments/environment';
import { USERS_URLS } from '../../providers/routes/account.routes';
import { SWAP_URLS } from '../../providers/routes/swap.routes';
import { getParams } from '../authentication/utils';
import { getCurrencyNetwork } from './utils';

export interface SwapService {
  convert(data: any, accessToken: string): Promise<any>;
  swap(data: any, accessToken: string): Promise<any>;
  report(data: any): Promise<any>;
}

export class CommonSwap {
  readonly URLS = SWAP_URLS;
  readonly USER_URLS = USERS_URLS;
  private swapPairs: SwapPair[] = [];
  pageSize = 20;

  constructor(
    protected plt: PlatformProvider,
    protected http: HttpClient,
    protected platformProvider: PlatformProvider,
  ) {}

  registerWallet(wallet: Wallet): Promise<void> {
    const { ticker, addresses: a } = wallet;
    const addresses = a.reduce((acc, val) => acc.concat(val), []).map(a => a.address);
    const uniqueAddresses = [...new Set<string>(addresses)];

    return this.addAddress({
      currency: ticker,
      currencyNetwork: getCurrencyNetwork(wallet.type, ticker).toUpperCase(),
      addresses: uniqueAddresses,
    });
  }

  addAddress(data: AddAddressesRequestBody): Promise<void> {
    let url = this.URLS.wallets.href;
    if (!this.plt.isCordova) {
      url = environment.CORS_ANYWHERE + url;
    }
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      ...HeadersService.simplioHeaders,
    });

    return this.http
      .post<void>(url, data, { headers })
      .toPromise()
      .catch((err: HttpErrorResponse) => {
        console.error('Adding address has failed', data, err);
        if (!err.error && err.status === 404) {
          throw new Error('Connection issue');
        } else {
          throw new Error('Adding address has failed');
        }
      });
  }

  fetchList(params?: { swapType: SwapType; currency: SupportedFiat }): Promise<SwapPair[]> {
    let url = this.URLS.listSwaps.href;
    if (!this.plt.isCordova) {
      url = environment.CORS_ANYWHERE + url;
    }
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      ...HeadersService.simplioHeaders,
    });

    return this.http
      .get<SwapPair[]>(url, { headers, params })
      .toPromise()
      .catch((err: HttpErrorResponse) => {
        console.error('Listing available swaps has failed');
        throw err;
      });
  }

  getList(params?: { swapType: SwapType; currency: SupportedFiat }): Promise<SwapPair[]> {
    return this.fetchList(params).then(list => {
      this.swapPairs = list;
      return list;
    });
  }

  protected getReport(params: SwapReportRequestParams): Promise<SwapReportPage> {
    let url = SWAP_URLS.report.href;
    if (!this.plt.isCordova) {
      url = environment.CORS_ANYWHERE + url;
    }
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      ...HeadersService.simplioHeaders,
    });
    const reqParams = getParams(params);

    return this.http
      .get<SwapReportPage>(url, { headers, params: reqParams })
      .toPromise()
      .catch((err: HttpErrorResponse) => {
        console.error('Reporting swaps has failed');
        throw err;
      });
  }
}
