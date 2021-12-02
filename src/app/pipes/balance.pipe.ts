import { Pipe, PipeTransform } from '@angular/core';
import { pipeAmount, UtilsService } from '../services/utils.service';
import { WalletType } from '../interface/data';

@Pipe({
  name: 'balance',
})
export class BalancePipe implements PipeTransform {
  transform(
    value: number,
    coin,
    walletType: WalletType,
    decimal: number,
    numb: number = 8,
  ): number {
    const wType = walletType || WalletType.BITCORE_ZCASHY;
    const p = p => Math.pow(10, p);
    const d = Math.min(decimal, 8);
    return parseFloat(pipeAmount(value, coin, wType, decimal, true).toFixed(d));
  }
}
