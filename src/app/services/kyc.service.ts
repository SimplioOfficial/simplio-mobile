import { Injectable } from '@angular/core';
import { SumSubTokenResponse, VerificationRecord } from '../interface/kyc';
import { AuthenticationProvider } from '../providers/data/authentication.provider';
import { KYC_URLS } from '../providers/routes/account.routes';
import { SwipeluxProvider } from '../providers/swipelux/swipelux-provider.service';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root',
})
export class KycService {
  constructor(
    private http: HttpService,
    private swipeluxProvider: SwipeluxProvider,
    private authProvider: AuthenticationProvider,
  ) {}

  getSharedToken(client = 'swipelux'): Promise<SumSubTokenResponse> {
    const url = KYC_URLS.shareToken.href;
    const headers = this.http.getHttpHeaders('application/json', true);

    return this.http.get<any>(url, { headers, params: { client } });
  }

  getAccessToken(): Promise<SumSubTokenResponse> {
    const url = KYC_URLS.accessToken.href;
    const headers = this.http.getHttpHeaders('application/json', true);

    return this.http.get<any>(url, { headers });
  }

  getVerificationsRecords(): Promise<VerificationRecord[]> {
    const url = KYC_URLS.verificationRecord.href;
    const headers = this.http.getHttpHeaders('application/json', true);

    this.authProvider.pushSumsubStatus('');
    this.authProvider.pushVerificationRecord(null);
    return this.http
      .get<any>(url, { headers })
      .then(records => {
        const record = records.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))[0]; // get the latest record
        this.authProvider.pushVerificationRecord(record);
        this.authProvider.pushSumsubStatus(record.detail.reviewAnswer);

        console.log(45, record.detail.reviewAnswer);
        if (record.detail.reviewAnswer === 'GREEN') {
          this.getSharedToken().then(token => this.swipeluxProvider.setShareToken(token.token));
        }

        return records;
      })
      .catch(e => {
        this.authProvider.pushSumsubStatus('');
        throw e;
      });
  }
}
