import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { HttpService } from './http.service';

export type CountryCode = {
  code: string;
  englishName: string;
  name: string;
  flag: string;
};

export type PhoneCodeResponse = Array<{
  callingCodes: string[];
  nativeName: string;
  name: string;
  flag: string;
  alpha3Code: string;
}>;

export type CountryCodeResponse = {
  alpha3Code: string;
  name: string;
  nativeName: string;
  flag: string;
};

export type CountryCodesResponse = CountryCodeResponse[];

type RequestConfig = {
  url: string;
  fields: string[];
};

@Injectable({
  providedIn: 'root'
})
export class CountryService {
  private readonly BASE_URL = 'https://restcountries.com/v2';

  constructor(private httpService: HttpService) {}

  /**
   *
   * @param onSuccess
   * @param onError
   */
  getPhoneCodes(onSuccess = (res: CountryCode[]) => {}, onError = (err: Error) => {}): void {
    const config: RequestConfig = {
      url: `${this.BASE_URL}/all`,
      fields: []
      // fields: ['nativeName', 'callingCodes', 'flag', 'alpha3Code']
    };

    const _onSuccess = (res: PhoneCodeResponse) => {
      onSuccess(
        res
          .map(r => ({
            flag: r.flag,
            name: r.nativeName,
            englishName: r.name,
            code: r.alpha3Code,
            callingCode: `+${r.callingCodes[0]}`
          }))
          .map(r => ({
            code: r.callingCode,
            englishName: r.englishName,
            flag: r.flag,
            name: r.name
          }))
      );
    };

    this._getCodes<PhoneCodeResponse>(config, _onSuccess, onError);
  }

  /**
   *
   * @param onSuccess
   * @param onError
   */
  getCountryCodes(onSuccess = (res: CountryCode[]) => {}, onError = (err: Error) => {}): void {
    const config: RequestConfig = {
      url: `${this.BASE_URL}/all`,
      fields: ['nativeName', 'alpha3Code', 'flag']
    };

    const _onSuccess = (res: CountryCodesResponse) => {
      onSuccess(
        res.map(r => ({
          flag: r.flag,
          name: r.nativeName,
          englishName: r.name,
          code: r.alpha3Code
        }))
      );
    };

    this._getCodes<CountryCodesResponse>(config, _onSuccess, onError);
  }

  getCountryCode(code: string = 'cze'): Promise<CountryCode> {
    const config: RequestConfig = {
      url: `${this.BASE_URL}/${code}`,
      fields: ['nativeName', 'alpha3Code', 'flag']
    };

    return new Promise((res, rej) => {
      const _onSuccess = (r: CountryCodeResponse) =>
        res({
          flag: r.flag,
          name: r.nativeName,
          englishName: r.name,
          code: r.alpha3Code
        });
      this._getCodes<CountryCodeResponse>(config, _onSuccess, rej);
    });
  }

  /**
   * @param config
   * @param onSuccess
   * @param onError
   */
  private _getCodes<T>(
    config: RequestConfig = { url: '', fields: [] },
    onSuccess = (res: T) => {},
    onError = (err: Error) => {}
  ): void {
    const params = new HttpParams().set('fields', config.fields.join(';'));

    const _onError = err => {
      onError(new Error('ERROR'));
    };

    this.httpService
      .get<T>(config.url, { params })
      .then(res => onSuccess(res))
      .catch(err => _onError(err));
  }
}
