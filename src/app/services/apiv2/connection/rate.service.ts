import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import { Rate } from 'src/app/interface/data';
import { environment } from 'src/environments/environment';
import { NetworkService } from './network.service';

@Injectable({
  providedIn: 'root',
})
export class RateService {
  readonly RATES_URL = 'https://rates.simplio.io';

  private _rate = new BehaviorSubject<[boolean, Rate[]]>([false, []]);
  rate$ = this._rate.pipe(map(([_, r]) => r));
  pureRate$ = this._rate.asObservable();

  get rateValue(): Rate[] {
    const [_, rates] = this._rate.value;
    return rates;
  }

  constructor(private networkService: NetworkService) {
    this.refresh(false);
  }

  getRateOf(code: string): Rate | null {
    const rates = this.rateValue || [];
    return rates.find(r => r.code === code) || null;
  }

  refresh(skip = true) {
    return this.getRate()
      .then(res => {
        this._rate.next([skip, res]);
        return true;
      })
      .catch(err => {
        console.log(err);
        return false;
      });
  }

  pushRateServer(ticker: string) {
    const body = {
      token: 'sjdfjsdhfkshfksdfsd',
      ticker,
    };
    this.networkService.post(environment.DATA + 'addcoin', body);
  }

  getRate(): Promise<Rate[]> {
    return new Promise<any>((resolve, reject) => {
      this.networkService
        .get(environment.DATA + 'rates')
        .then(resolve)
        .catch(err => {
          this.networkService.get(this.RATES_URL).then(resolve).catch(reject);
        });
    });
  }
}
