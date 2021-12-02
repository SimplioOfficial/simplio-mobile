import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SignedTransaction } from 'src/app/interface/data';
import {
  SwapStatusText,
  SwapSingleResponse,
  SwapConvertRequestParams,
  SwapConvertResponse,
  SwapReportRequestParams,
  SwapType,
  SwapTransaction,
  SwapReportPage,
  SwapSingleUpdate,
} from 'src/app/interface/swap';
import { PlatformProvider } from 'src/app/providers/platform/platform';
import { getParams } from '../authentication/utils';
import { CommonSwap, SwapService } from './swap-common';

type ReportData = {
  pageNumber: number | null;
  swapStatus: SwapStatusText | SwapStatusText[];
};

@Injectable({
  providedIn: 'root',
})
export class SingleSwapService extends CommonSwap implements SwapService {
  constructor(
    protected plt: PlatformProvider,
    protected platformProvider: PlatformProvider,
    protected http: HttpClient,
  ) {
    super(plt, http, platformProvider);
  }

  swap(swapTransaction: SwapSingleResponse): Promise<any> {
    const url = this.URLS.singleSwap.href;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.http.post(url, swapTransaction, { headers }).toPromise();
  }

  cancel(sagaId: string): Promise<void> {
    const url = this.URLS.singleSwap.href;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    const body = { sagaId };
    return this.http
      .request<void>('DELETE', url, { headers, body })
      .toPromise()
      .catch((err: HttpErrorResponse) => {
        console.error('Cancelling swap has failed');
        throw err;
      });
  }

  convert(data: SwapConvertRequestParams): Promise<SwapConvertResponse> {
    const url = this.URLS.singleSwapParams.href;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    const params = getParams(data);

    return this.http.get<SwapConvertResponse>(url, { headers, params }).toPromise();
  }

  report(data: ReportData): Promise<SwapReportPage> {
    const params: SwapReportRequestParams = {
      pageNumber: data.pageNumber ?? 1,
      pageSize: this.pageSize,
      swapStatus: data.swapStatus,
      swapType: SwapType.Single,
    };

    return this.getReport(params);
  }

  update(data: SwapSingleUpdate): Promise<void> {
    const url = this.URLS.singleSwap.href;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http
      .put(url, data, { headers })
      .toPromise()
      .then(() => {})
      .catch((err: HttpErrorResponse) => {
        console.error('Updating swap transaction has failed');
        throw err;
      });
  }

  getLinkedUser(address: string): Promise<any> {
    const url = this.URLS.linkedAccount.href;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http
      .get(url + '/' + address, { headers })
      .toPromise()
      .catch((err: HttpErrorResponse) => {
        throw err;
      });
  }

  getAccount(userId: string): Promise<any> {
    const url = this.USER_URLS.email.href;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http
      .post(url, { userId }, { headers })
      .toPromise()
      .catch((err: HttpErrorResponse) => {
        throw err;
      });
  }

  unlinkAddress(address: string): Promise<any> {
    const url = this.URLS.unlinkAddress.href;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http
      .delete(url + '/' + address, { headers })
      .toPromise()
      .catch((err: HttpErrorResponse) => {
        throw err;
      });
  }

  // obsolete
  async savePendingSwap(data: {
    email: string;
    swapTx: SwapTransaction<SignedTransaction>;
  }): Promise<void> {
    const { email, swapTx } = data;
    try {
    } catch (err) {
      console.error(err);
      throw new Error('Saving swap has failed');
    }
  }
}
