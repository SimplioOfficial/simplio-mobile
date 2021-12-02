import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, of } from '@polkadot/x-rxjs';
import { map } from 'rxjs/operators';
import { sortBy } from 'lodash';
import { CoinItem, coins } from 'src/assets/json/coinlist';
import { environment } from 'src/environments/environment';
import { NetworkService } from './network.service';
import { UtilsService } from '../../utils.service';
import { SolFeeToken } from 'src/app/interface/data';
import { IoService } from '../../io.service';

@Injectable({
  providedIn: 'root',
})
export class CoinsService {
  private _coinsData = new BehaviorSubject<CoinItem[]>(null);
  coinsData$ = this._coinsData.pipe(map(w => sortBy(w, 'name')));
  _promoData = new BehaviorSubject<CoinItem[]>(null);
  promoData$ = this._promoData.pipe(map(w => sortBy(w, 'name')));
  _feeData = new BehaviorSubject<SolFeeToken[]>(null);
  feeData$ = this._feeData.pipe(map(w => sortBy(w, 'ticker')));
  _fePercentageData = new BehaviorSubject<number>(null);
  feePercentageData$ = this._fePercentageData.pipe();

  constructor(private networkService: NetworkService, private ioService: IoService) {}

  async init() {
    if (!this._coinsData.value) {
      return this.networkService
        .get(
          environment.production ? environment.DATA + 'coinsv2' : environment.DATA + 'coinsbetav2',
        )
        .then((res: any) => {
          const data = JSON.parse(this.ioService.decrypt(res.result, environment.DATA_PASSWORD));
          // console.log("Server coin res", res);
          let c = data.coins.filter(
            e => !coins.find(ee => e.type === ee.type && e.ticker == ee.ticker),
          );
          this._coinsData.next(c.concat(coins));
          this._promoData.next(data.promo);
          this._feeData.next(data.fee);
          this._fePercentageData.next(data.percentage);

          return true;
        })
        .catch(err => {
          console.log('Cannot get coin from server side');
          this._coinsData.next(coins);
          return false;
        });
    } else {
      return true;
    }
  }

  getCoins() {
    return this._coinsData.value;
  }

  getFeeSolCoins() {
    return this._feeData.value;
  }

  getFeePercentageSolCoins() {
    return this._fePercentageData.value;
  }
}
