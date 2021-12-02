import { Pipe, PipeTransform } from '@angular/core';

interface NotionNumberFormatOption extends Intl.NumberFormatOptions {
  notation?: 'compact';
  compactDisplay?: 'short' | 'long';
}

@Pipe({
  name: 'fiat',
})
export class FiatPipe implements PipeTransform {
  zeroDecimals = 0;
  factorDecimals = 2;

  private largeValOpt: NotionNumberFormatOption = {
    notation: 'compact',
    compactDisplay: 'short',
  };

  private zeroValOpt: Intl.NumberFormatOptions = {
    maximumFractionDigits: this.zeroDecimals,
  };

  getLocale(currency: string): string {
    switch (currency) {
      case 'EUR':
        return 'cs-CZ';
      case 'USD':
      default:
        return 'en-US';
    }
  }

  transform(value: number | string, ...args: [string, string, boolean]): number | string {
    let v = value;
    if (typeof v === 'string') {
      v = parseInt(v) || 0;
    }

    const fiatNum = this.getFiatValue(v);
    try {
      const [currency, locale, keepValue] = args;
      return keepValue
        ? this._formatToLocale(v, currency, locale)
        : this._formatToLocale(fiatNum, currency, locale);
    } catch (e) {
      return fiatNum;
    }
  }

  getFiatValue(value: number): number {
    const v: string = value.toFixed(this.factorDecimals);
    return parseFloat(v) ? parseFloat(v) : 0;
  }

  private _formatToLocale(value: number, locale: string = 'en', curr: string = ''): string {
    return new Intl.NumberFormat(this.getLocale(curr), this.getOptions(value, curr)).format(value);
  }

  private getOptions(value, currency): NotionNumberFormatOption {
    let baseOpt;
    if (currency !== '') {
      baseOpt = {
        style: 'currency',
        currency,
        maximumFractionDigits: this.factorDecimals,
      };
    } else {
      baseOpt = {
        maximumFractionDigits: this.factorDecimals,
      };
    }
    if (value > 1000000) {
      return Object.assign(baseOpt, this.largeValOpt);
    } else if (!value) {
      return Object.assign(baseOpt, this.zeroValOpt);
    }
    return baseOpt;
  }
}
