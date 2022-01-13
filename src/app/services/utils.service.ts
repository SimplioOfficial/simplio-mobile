import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ToastController, AlertController, ModalController } from '@ionic/angular';
import { PredefinedColors } from '@ionic/core/dist/types/interface';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { HTTP } from '@ionic-native/http/ngx';
import { WalletType, Account } from 'src/app/interface/data';
import { Translate, ExtendedAlertOptions, sanitizeExtendedInput } from '../providers/translate/';

import { fromPairs, isString, toPairs } from 'lodash';
import { coinNames } from './api/coins';
import { validateMnemonic } from 'bip39';
import { InterestRate } from '@simplio/backend/interface/stake';
import BN from "bn.js";

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  static txsProperties = ['items', 'tokenItem', 'solanaTxs', 'safecoinTxs', 'polkadotTxs'];

  constructor(
    private toastController: ToastController,
    private alertController: AlertController,
    private modalCtrl: ModalController,
    private router: Router,
    public $: Translate,
    private diagnostic: Diagnostic,
    private http: HTTP,
  ) {
    this._currentUrl = this.router.url;
    router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this._previousUrl = this._currentUrl;
        this._currentUrl = event.url;
      }
    });
  }

  get previousUrl() {
    return this._currentUrl ?? '';
  }

  account: Account;
  oldPassword: string;
  tabBarStatus = new BehaviorSubject<boolean>(true);

  private _previousUrl: string;
  private _currentUrl: string;

  private static _radnomString(bits) {
    const ran = 1 + Math.random();
    return ((ran * 0x10000) | 0).toString(bits).substring(1);
  }

  static uuid(): string {
    const bits = 16;
    const h = this._radnomString.bind(this, bits);
    return `${(h(), h())}-${(h(), h())}-${(h(), h())}-${(h(), h())}`;
  }

  static datedUUID(): string {
    return `${UtilsService.uuid()}_${Date.now()}`;
  }

  static resolveNumpadValue(
    num: number,
    value: string,
    opt: { alwaysValue: boolean } = { alwaysValue: true },
  ): string {
    switch (num) {
      case 0:
        if (!parseFloat(value) && !value.includes('.')) return value;
        return value + '0';
      case 10:
        const hasDot = value.includes('.');
        return hasDot ? value : value + '.';
      case -1:
        const cutNumStr = value.slice(0, value.length - 1);
        if (opt.alwaysValue) return cutNumStr === '' ? '0' : cutNumStr;
        return cutNumStr;
      default:
        if (value === '0') return num.toString();
        return value + num.toString();
    }
  }

  static isCoin(type) {
    return (
      type === WalletType.BITCORE_ZCASHY ||
      type === WalletType.BITCORE_LIB ||
      type === WalletType.BITCORE_CUSTOM
    );
  }

  static isErcCoin(type) {
    return type === WalletType.ETH || type === WalletType.BSC || type === WalletType.ETC;
  }

  static isErcToken(type) {
    return type === WalletType.ETH_TOKEN || type === WalletType.BSC_TOKEN;
  }

  static isSolanaToken(type) {
    return type === WalletType.SOLANA_TOKEN || type === WalletType.SOLANA_TOKEN_DEV;
  }

  static isToken(type) {
    return isSolanaToken(type) || isErcToken(type);
  }

  static isSolana(type) {
    return type === WalletType.SOLANA || type === WalletType.SOLANA_DEV;
  }

  static isSolanaDev(type) {
    return type === WalletType.SOLANA_DEV || type === WalletType.SOLANA_TOKEN_DEV;
  }

  static isPolkadot(type) {
    return type === WalletType.POLKADOT;
  }

  /**
   * @todo remove duplicity with pipeAmount
   */
  static sPipeAmount(
    amount: number = 0,
    ticker: string,
    type: WalletType,
    decimal: number,
    reverse: boolean = false,
  ) {
    if (amount === 0) {
      return 0;
    }
    if (isString(amount)) {
      amount = Number(amount);
    }
    if (!decimal) {
      decimal = UtilsService.getDecimals(type, ticker);
    }
    if (decimal === 0 || decimal === undefined) return amount;

    if (reverse) {
      return parseFloat(div10(amount.toString(), decimal));
    } else {
      return parseInt(mul10(amount.toString(), decimal));
    }
  }

  static div10(amount: string, decimal: number): string {
    const arr = [...amount];
    if (!arr.includes('.')) {
      arr.splice(arr.length, 0, '.');
    }
    while (decimal > 0) {
      const idx = arr.indexOf('.');
      if (idx === 0) {
        arr.splice(0, 0, '0');
      } else {
        decimal--;
        [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
      }
    }
    const idx = arr.indexOf('.');
    if (idx === 0) {
      arr.splice(0, 0, '0');
    }
    return arr.join('');
  }

  static mul10(amount: string, decimal: number): string {
    const arr = [...amount];
    while (decimal > 0) {
      const idx = arr.indexOf('.');
      if (idx === -1) {
        arr.splice(arr.length, 0, '0');
      } else {
        if (idx === arr.length - 1) {
          arr.splice(arr.length, 1, '0');
        }
        [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
      }
      decimal--;
    }
    const idx = arr.indexOf('.');
    if (idx === arr.length - 1) {
      arr.splice(arr.length - 1, 1);
    }
    return arr.join('');
  }
  /**
   * Get a appropriete decimal value
   * for a wallet type and its coin
   * @param type
   * @param coin
   * @note Why do we import the coin object anyway
   * and we calculate the value on the side
   */
  static getDecimals(type: WalletType, ticker: string): number {
    const decimals = {
      [WalletType.BITCORE_ZCASHY]: 8,
      [WalletType.BITCORE_LIB]: 8,
      [WalletType.BITCORE_CUSTOM]: 8,
      [WalletType.ETH]: 18,
      [WalletType.ETH_TOKEN]: 18,
      [WalletType.BSC]: 18,
      [WalletType.BSC_TOKEN]: 18,
      [WalletType.ETC]: 18,
      [WalletType.SOLANA]: 9,
      [WalletType.SOLANA_DEV]: 9,
      [WalletType.SAFE]: 9,
      [WalletType.POLKADOT]: 10,
    };
    return decimals[type];
  }

  static sortByName<T extends { name: string }>(wallets: T[]): T[] {
    return wallets.sort((wA, wB) => {
      const a = wA.name.toUpperCase();
      const b = wB.name.toUpperCase();
      if (a < b) return -1;
      else if (a > b) return 1;
      else return 0;
    });
  }

  static fromEntries(arr) {
    return arr.reduce((acc, [k, v]) => ((acc[k] = v), acc), {});
  }

  grantCameraPermission(onSuccess = (r: any) => {}, onError = (err: any) => {}) {
    this.diagnostic
      .isCameraAuthorized()
      .then(authorized => {
        console.log('Location is ' + (authorized ? 'authorized' : 'unauthorized'));
        if (!authorized) {
          // location is not authorized
          this.diagnostic
            .requestCameraAuthorization()
            .then(status => {
              switch (status) {
                case this.diagnostic.permissionStatus.NOT_REQUESTED:
                  console.log('Permission not requested');
                  return onError('Permission not requested');
                case this.diagnostic.permissionStatus.GRANTED:
                  console.log('Permission granted');
                  return onSuccess('granted');
                case this.diagnostic.permissionStatus.DENIED_ONCE:
                  console.log('Permission denied');
                  return onError('Permission denied');
                case this.diagnostic.permissionStatus.DENIED_ALWAYS:
                  console.log('Permission permanently denied');
                  return onError('Permission permanently denied');
              }
            })
            .catch(error => {
              onError(new Error(error.message));
            });
        }
      })
      .catch(err => {
        onError(err);
      });
  }

  setAccount(a: Account) {
    this.account = a;
  }

  showElement(element) {
    element.style.display = 'block';
  }

  hideElement(element) {
    element.style.display = 'none';
  }

  changeStateElement(element) {
    if (element.style.display === 'none') {
      element.style.display = 'block';
    } else {
      element.style.display = 'none';
    }
  }

  async showToast(
    message: string | string[],
    duration?: number,
    color?: PredefinedColors,
    position?: any,
  ): Promise<void> {
    const toast = await this.toastController.create({
      message: await this.$.translate(sanitizeExtendedInput(message)),
      duration: duration ? duration : 1000,
      position: position || 'top',
      animated: true,
      color: color || 'success',
    });
    toast.present();
  }

  async createAlert(options: ExtendedAlertOptions): Promise<HTMLIonAlertElement> {
    return await this.alertController.create(await this.$.translateAlert(options));
  }

  async presentAlert(options: ExtendedAlertOptions): Promise<void> {
    return this.createAlert(options).then(alert => alert.present());
  }

  setTabBarStatus(status: boolean) {
    this.tabBarStatus.next(status);
  }

  isValidType(t: WalletType) {
    return (
      t === WalletType.BITCORE_LIB ||
      t === WalletType.BITCORE_ZCASHY ||
      t === WalletType.BITCORE_CUSTOM ||
      t === WalletType.ETH ||
      t === WalletType.ETH_TOKEN ||
      t === WalletType.BSC ||
      t === WalletType.BSC_TOKEN ||
      t === WalletType.ETC ||
      t === WalletType.SOLANA ||
      t === WalletType.SOLANA_DEV ||
      t === WalletType.SOLANA_TOKEN ||
      t === WalletType.SOLANA_TOKEN_DEV
    );
  }

  // post data use native HTTP
  postData(url: any, params: any, header: any = {}) {
    return new Promise((resolve, reject) => {
      for (const [key, value] of Object.entries(header)) {
        this.http.setHeader('*', String(key), String(value));
      }

      this.http.setDataSerializer('json');
      this.http
        .post(url, params, null)
        .then(data => {
          console.log('post data', data);
          let d;
          try {
            d = JSON.parse(data.data);
          } catch (ex) {}
          resolve(d);
        })
        .catch(error => {
          if (error.status !== 500) {
            console.log('post error', error);
          }
          reject(error);
        });
    });
  }

  // get data use native HTTP
  getData(url: string) {
    return new Promise((resolve, reject) => {
      this.http
        .get(url, {}, {})
        .then(data => resolve(JSON.parse(data.data)))
        .catch(error => reject(error));
    });
  }
}

export const validateSeeds = (mnemo: string) => {
  if (validateMnemonic(mnemo)) {
    return true;
  } else {
    return false;
  }
};

const makeSMSMessage =
  (smsFormat = '*1 - *2', sign = '<CODE>') =>
  (rawMessage: string) => {
    return rawMessage.replace(sign, smsFormat);
  };

export const makeDefaultSMSMessage = makeSMSMessage();

export const compareValuesWith = <T extends Record<string, any>>(obj: T, superiorObj: T): T => {
  const e = toPairs(obj).map(([k, v]) => [k, superiorObj[k] === v ? superiorObj[k] : v]);
  return fromPairs(e) as T;
};

const radnomString = (bits: number): string => {
  const ran = 1 + Math.random();
  return ((ran * 0x10000) | 0).toString(bits).substring(1);
};

export const uuid = (bits: number = 16): string => {
  const h = () => radnomString(bits);
  return `${(h(), h())}-${(h(), h())}-${(h(), h())}-${(h(), h())}`;
};

export const datedUUID = () => `${uuid()}_${Date.now()}`;

/* To copy Text from Textbox */
export const copyInputMessage = value => {
  const selBox = document.createElement('textarea');
  selBox.style.position = 'fixed';
  selBox.style.left = '0';
  selBox.style.top = '0';
  selBox.style.opacity = '0';
  selBox.value = value;
  document.body.appendChild(selBox);
  selBox.focus();
  selBox.select();
  document.execCommand('copy');
  document.body.removeChild(selBox);
};

export const isCoin = type => {
  return (
    type === WalletType.BITCORE_ZCASHY ||
    type === WalletType.BITCORE_LIB ||
    type === WalletType.BITCORE_CUSTOM
  );
};

export const isErcCoin = type => {
  return type === WalletType.ETH || type === WalletType.BSC || type === WalletType.ETC;
};

export const isErcToken = type => {
  return type === WalletType.ETH_TOKEN || type === WalletType.BSC_TOKEN;
};

export const isSolana = type => {
  return type === WalletType.SOLANA || type === WalletType.SOLANA_DEV;
};

export const isSolanaToken = type => {
  return type === WalletType.SOLANA_TOKEN || type === WalletType.SOLANA_TOKEN_DEV;
};

export const isToken = type => {
  return isSolanaToken(type) || isErcToken(type);
};
export const isPolkadot = type => {
  return type === WalletType.POLKADOT;
};

export const isNullOrEmpty = (str: string): boolean => {
  return !str || !!str.trim();
};

export const parseProgramError = (code: string): string => {
  return code;
};

export const pipeAmount = (
  amount: number,
  ticker: string,
  type: WalletType,
  decimal: number,
  reverse: boolean = false,
) => {
  if (amount === 0) {
    return 0;
  }
  if (!decimal) {
    decimal = UtilsService.getDecimals(type, ticker);
  }
  if (decimal === 0 || decimal === undefined) return amount;

  if (reverse) {
    return parseFloat(div10(amount.toString(), decimal));
  } else {
    return parseInt(mul10(amount.toString(), decimal));
  }
};

export const div10 = (amount: string, decimal: number): string => {
  const arr = [...amount];
  if (!arr.includes('.')) {
    arr.splice(arr.length, 0, '.');
  }
  while (decimal > 0) {
    const idx = arr.indexOf('.');
    if (idx === 0) {
      arr.splice(0, 0, '0');
    } else {
      decimal--;
      [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
    }
  }
  const idx = arr.indexOf('.');
  if (idx === 0) {
    arr.splice(0, 0, '0');
  }
  return arr.join('');
};

export const mul10 = (amount: string, decimal: number): string => {
  const arr = [...amount];
  while (decimal > 0) {
    const idx = arr.indexOf('.');
    if (idx === -1) {
      arr.splice(arr.length, 0, '0');
    } else {
      if (idx === arr.length - 1) {
        arr.splice(arr.length, 1, '0');
      }
      [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
    }
    decimal--;
  }
  const idx = arr.indexOf('.');
  if (idx === arr.length - 1) {
    arr.splice(arr.length - 1, 1);
  }
  return arr.join('');
};


export const toNative = (amount: number, decimals: number): BigInt => {
  return BigInt(mul10(amount.toString(), decimals));
}

export const toString = (amount: BN, decimals: number): string => {
  return parseFloat(div10(amount.toString(), decimals)).toString();
}

export const numberToString = (amount: number, decimals: number): string => {
  return parseFloat(div10(amount.toString(), decimals)).toString();
}

export const toInterest = (amount: number): BigInt => {
  return BigInt(mul10(amount.toString(), 5));
}

export const toInterestString = (amount: BN): string => {
  return parseFloat(div10(amount.toString(), 5)).toString();
}


export const calculateInterest = (
  last_payment: number,
  current_time: number,
  amount: number,
  decimal: number,
  interest_info: InterestRate[],
  tiers,
) => {
  if (current_time <= last_payment) {
    return 0;
  } else {
    let tier_ratio = getRatio(amount, tiers, decimal);
    interest_info.sort((a, b) => b.unixTimestamp - a.unixTimestamp);
    let filter =
      getInterestList(last_payment, current_time, interest_info);
    let interest = 0;
    let start_time = current_time;
    filter.forEach(element => {
      {
        let end_time = start_time;
        start_time = element.unixTimestamp;
        interest += calculate(amount, Math.max(element.unixTimestamp, last_payment), end_time, element.interestRate, tier_ratio);
      }

      interest = Math.max(0, interest);
    });
    return interest;
  }
}

export const getRatio = (amount, tiers, decimals) => {
  const tier6 = tiers.find(e => e.name === 6);
  const tier5 = tiers.find(e => e.name === 5);
  const tier4 = tiers.find(e => e.name === 4);
  const tier3 = tiers.find(e => e.name === 3);
  const tier2 = tiers.find(e => e.name === 2);
  const tier1 = tiers.find(e => e.name === 1);
  let tierRatio = 1;
  let a = numberToString(amount, decimals);
  if (a >= tier6.minValue && tier6.minValue > 0) {
    tierRatio = tier6.ratio;
  } else if (a >= tier5.minValue && tier5.minValue > 0) {
    tierRatio = tier5.ratio;
  } else if (a >= tier4.minValue && tier4.minValue > 0) {
    tierRatio = tier4.ratio;
  } else if (a >= tier3.minValue && tier3.minValue > 0) {
    tierRatio = tier3.ratio;
  } else if (a >= tier2.minValue && tier2.minValue > 0) {
    tierRatio = tier2.ratio;
  } else if (a >= tier1.minValue && tier1.minValue > 0) {
    tierRatio = tier1.ratio;
  }
  return tierRatio;
}

export const getInterestList = (
  lastPayment: number,
  currentTime: number,
  interestInfo: InterestRate[]): InterestRate[] => {
  let filter = [];
  interestInfo.some(element => {
    let time = element.unixTimestamp;
    if (time < currentTime) {
      filter.push(element);
    }
    if (time < lastPayment) {
      return true;
    }
  });
  return filter
}

export const calculate = (
  amount: number,
  start_time: number,
  end_time: number,
  interest_rate: number,
  tier_ratio: number,
) => {
  const a = Math.floor(Math.floor(Math.floor(Math.floor(((end_time - start_time) / 3600)) * 3600) * interest_rate
    * tier_ratio
    / 100)
    * amount
    / (365 * 24 * 60 * 60));
  return a > 0 ? a : 0;
}

export const parseError = (err: string) => {
  const splt = err.split("custom program error:");
  const errorIndex = parseInt(splt[1]);
  let rtn = err;
  switch (errorIndex) {
    default:
      break;
    case 0:
      rtn = "Your instruction is invalid, please contact support";
      break;
    case 1:
      rtn = "Token program is invalid, please contact support";
      break;
    case 2:
      rtn = "Error: Not rent exempt";
      break;
    case 3:
      rtn = "Error: Expected amount mismatch";
      break;
    case 4:
      rtn = "Error: You don't have permission to update data";
      break;
    case 5:
      rtn = "Error: Not request withdrawal";
      break;
    case 6:
      rtn = "Error: Already request withdrawal";
      break;
    case 7:
      rtn = "Error: Waiting withdrawal";
      break;
    case 8:
      rtn = "You don't have any staking reward, please try again later";
      break;
    case 9:
      rtn = "Error: You still have some staking reward, please try to withdraw it first";
      break;
    case 10:
      rtn = "Error: Invalid authority info";
      break;
    case 11:
      rtn = "Error: Invalid pool address";
      break;
    case 12:
      rtn = "Error: Invalid staking amount";
      break;
    case 13:
      rtn = "Error: Max locked value is reached";
      break;
    case 14:
      rtn = "Error: Pool not initialized";
      break;
    case 15:
      rtn = "Error: Incorrect pool deposit address";
      break;
    case 16:
      rtn = "Error: Incorrect withdrawal address";
      break;
    case 17:
      rtn = "Error: Insufficient Amount";
      break;
    case 18:
      rtn = "Less than minimum amount";
      break;
    case 19:
      rtn = "Error: Invalid initializer";
      break;
    case 20:
      rtn = "Error: Rate account list is incorrect";
      break;
    case 21:
      rtn = "Error: End rate account list is incorrect";
      break;
    case 22:
      rtn = "Error: Amount overflow";
      break;
    case 23:
      rtn = "Error: Invalid last payment";
      break;
    case 24:
      rtn = "Error: Invalid time for new rate account";
      break;
  }
  return rtn;
}
