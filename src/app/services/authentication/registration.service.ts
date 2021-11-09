import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AccountCredentials, AgreementData, RegisterAccountData } from 'src/app/interface/account';
import { AccountRegistrationError } from 'src/app/providers/errors/account-registration-error';
import { Translate } from 'src/app/providers/translate';
import { AGREEMENTS_URL, USERS_URLS } from 'src/app/providers/routes/swap.routes';
import { HttpFallbackService } from '../apiv2/connection/http-fallback.service';

@Injectable({
  providedIn: 'root',
})
export class RegistrationService {
  constructor(private $: Translate, private http: HttpFallbackService) {}

  register(data: RegisterAccountData): Promise<AccountCredentials> {
    const url = USERS_URLS.account.href;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    const body = {
      userId: data.cred.userId,
      email: data.cred.email,
      password: data.cred.password,
    };

    return this.http
      .post<void>(url, body, { headers })
      
      .then(() => data.cred)
      .catch((err: HttpErrorResponse) => {
        throw new AccountRegistrationError(err, this.$);
      });
  }

  putAgreementData(data: AgreementData): Promise<any> {
    const url = USERS_URLS.account.href;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    delete data.advertising; // remove unused property
    const body = {
      agreements: JSON.stringify(data),
    };

    return this.http.put(url, body, { headers });
  }

  getIpAddress(): Promise<string> {
    return this.http.get<any>('http://www.ip-api.com/json').then(res => res.query);
  }
}
