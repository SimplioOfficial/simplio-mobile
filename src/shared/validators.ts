import { FormControl, AbstractControl } from '@angular/forms';
import { wordlists } from 'bip39';
import { Wallet } from 'src/app/interface/data';
import { SwapConvertResponse } from 'src/app/interface/swap';
import { pipeAmount, UtilsService } from 'src/app/services/utils.service';
import { environment } from 'src/environments/environment';

export type ValidatorResponse = {
  result: boolean;
  msg: string;
};

type HasBudgetDep = {
  errMsg: string;
  convert?: boolean;
};

/**
 *  isEqual
 *  ---
 *  @todo add type support
 */
export function isEqual(compare) {
  return (c: FormControl): null | ValidatorResponse => {
    return compare === c.value
      ? null
      : {
          result: false,
          msg: '',
        };
  };
}

/**
 *  isNotEqual
 *  ---
 *  @todo add type support
 */
export function isNotEqual(compare) {
  return (c: FormControl): null | ValidatorResponse => {
    return compare !== c.value
      ? null
      : {
          result: false,
          msg: '',
        };
  };
}

/**
 *
 * @param params
 * @param equals
 */
export function compareValues(params: Array<string>, equals: boolean = false) {
  return (c: AbstractControl): null | ValidatorResponse => {
    const invalidRes: ValidatorResponse = {
      result: false,
      msg: '',
    };

    const vals = params.map(p => c.value[p]);
    const equal = vals.every((v, _, a) => v === a[0]);

    const res: boolean = equals ? equal : !equal;

    if (res) return null;
    else return invalidRes;
  };
}

/**
 * Checks if the converted amount is sufficient
 * and larger than zero.
 * @note Swap specific validator
 * @param dep
 */
export const isMinAmount =
  (dep: { isZeroMsg: string; isInsufficientMsg: string; errMsg: string; swapFeeErrMsg }) =>
  (c: AbstractControl): null | ValidatorResponse => {
    const invalidRes: ValidatorResponse = {
      result: false,
      msg: dep.isZeroMsg || '',
    };
    const { amount, swapResponse, sourceWallet, fee, feeWallet } = c.value as {
      amount: number;
      swapResponse: SwapConvertResponse;
      sourceWallet: Wallet;
      fee: number;
      feeWallet: Wallet;
    };

    if (
      pipeAmount(amount, sourceWallet?.ticker, sourceWallet?.type, sourceWallet?.decimal) >
      sourceWallet?.balance
    ) {
      invalidRes.msg = dep.errMsg;
      return invalidRes;
    }

    // It is invalid if the value is zero
    if (amount === 0 && fee === 0) {
      return invalidRes;
    }

    if (feeWallet && fee > feeWallet.balance) {
      invalidRes.msg = dep.swapFeeErrMsg;
      return invalidRes;
    }

    if (!swapResponse) {
      return invalidRes;
    }
    // It is valid if the source wallet amount is larger than minimum deposit amount
    if (swapResponse.SourceCurrentAmount >= swapResponse.SourceMinDepositAmount) return null;
    // It is invalid in any other case
    invalidRes.msg = dep.isInsufficientMsg
      .replace('<COIN>', sourceWallet.ticker || '')
      .replace('<AMOUNT>', swapResponse.SourceMinDepositAmount.toString());

    return invalidRes;
  };

/**
 * Checks if the source wallet has enough resources.
 * @note Swap specific validator
 * @param dep
 */
const hasBudgetDepDef: HasBudgetDep = {
  errMsg: '',
  convert: false,
};
export const hasBudget =
  (dep = hasBudgetDepDef) =>
  (c): null | ValidatorResponse => {
    const invalidRes: ValidatorResponse = {
      result: false,
      msg: dep.errMsg || '',
    };
    const { amount, sourceWallet: w } = c.value as {
      amount: number;
      sourceWallet: Wallet;
    };
    const balance = dep.convert
      ? pipeAmount(w?.balance, w?.ticker, w?.type, w?.decimal, true)
      : w?.balance;

    return balance >= amount ? null : invalidRes;
  };

export const hasBudgetSwap =
  (dep = hasBudgetDepDef) =>
  (c): null | ValidatorResponse => {
    const invalidRes: ValidatorResponse = {
      result: false,
      msg: dep.errMsg || '',
    };
    const {
      amount,
      sourceWallet: w,
      fee,
    } = c.value as {
      amount: number;
      sourceWallet: Wallet;
      fee: number;
    };
    const balance = dep.convert
      ? pipeAmount(w?.balance, w?.ticker, w?.type, w?.decimal, true)
      : w?.balance;
    const sFee = dep.convert ? pipeAmount(fee, w?.ticker, w?.type, w?.decimal, true) : fee;
    const sAmount = dep.convert
      ? amount
      : pipeAmount(amount, w?.ticker, w?.type, w?.decimal, false);

    if (!UtilsService.isToken(w?.type)) {
      if (sAmount > 0) return balance >= sAmount + sFee ? null : invalidRes;
      else return invalidRes;
    } else {
      return balance >= sAmount ? null : invalidRes;
    }
  };

/**
 * Checks if the returned response from API is valid.
 * @note Swap specific validator
 * @param c
 */
export const isAmountValid = (c: AbstractControl): null | ValidatorResponse => {
  const invalidRes: ValidatorResponse = {
    result: false,
    msg: '',
  };
  const { swapResponse } = c.value as { swapResponse: SwapConvertResponse };
  return swapResponse?.IsSourceCurrentAmountValid ? null : invalidRes;
};

/**
 * Checks if the returned response from API is valid.
 * @note Swap specific validator
 * @param c
 */
export const isDestinationFiatAmountValid =
  (dep: { isZeroMsg: string }) =>
  (c): null | ValidatorResponse => {
    const invalidRes: ValidatorResponse = {
      result: false,
      msg: dep.isZeroMsg || '',
    };
    const { destinationFiatValue } = c.value as {
      destinationFiatValue: number;
    };

    return destinationFiatValue > 0 ? null : invalidRes;
  };

/**
 * An value is greater than
 * a provided value
 *
 */
export const isGreaterThan = (minValue: number) => {
  return (c: AbstractControl): null | ValidatorResponse => {
    return c.value > minValue
      ? null
      : {
          result: false,
          msg: '',
        };
  };
};

export const isGreaterOrEqualThan = (minValue: number) => {
  return (c: AbstractControl): null | ValidatorResponse => {
    return c.value >= minValue
      ? null
      : {
          result: false,
          msg: ''
        };
  };
};

export const isLessThan = (maxValue: number) => {
  return (c: AbstractControl): null | ValidatorResponse => {
    return c.value < maxValue
      ? null
      : {
          result: false,
          msg: ''
        };
  };
};

export const isLessOrEqualThan = (maxValue: number) => {
  return (c: AbstractControl): null | ValidatorResponse => {
    return c.value <= maxValue
      ? null
      : {
          result: false,
          msg: ''
        };
  };
};

/**
 * An value is smaller than
 * a provided value
 *
 */
export const isAmountSufficient = (c: AbstractControl): null | ValidatorResponse => {
  const { wallet, amount } = c.value as {
    wallet: Wallet;
    amount: number;
  };
  return !!wallet && amount <= wallet.balance && amount > 0
    ? null
    : {
        result: false,
        msg: '',
      };
};

/**
 * Test amount of days in a month
 * c.value = { day: string, month: string, year: string }
 *
 */
export const isDateValid = (c: AbstractControl): null | ValidatorResponse => {
  const { day, month, year } = c.value;
  const daysInMonth: number = new Date(year, month, 0).getDate();
  const errRes = {
    result: false,
    msg: '',
  };
  if (day > daysInMonth) return errRes;
  else return null;
};

export const isEnabled = (c: AbstractControl): null | ValidatorResponse => {
  const invalidRes: ValidatorResponse = {
    result: false,
    msg: '',
  };

  if (!c.value) return invalidRes;

  const swapResponse = c.value as SwapConvertResponse;
  return swapResponse?.IsEnabled ? null : invalidRes;
};

export const checkWord = (c: AbstractControl): null | ValidatorResponse => {
  const { word } = c.value as {
    word: string;
  };
  const invalidRes: ValidatorResponse = {
    result: false,
    msg: '',
  };
  return validateWord(word?.trim().toLowerCase()) ? null : invalidRes;
};

export const validateWord = (word: string) => {
  const split = word?.split(' ');
  if (!environment.production) {
    if (split.length === 24 || split.length === 12) {
      return true;
    }
  }

  if (!!split && split.length > 1) {
    let result = true;
    split.forEach(word => (result = result && validateWord(word)));

    return result;
  } else {
    let found = false;
    Object.values(wordlists).some(element => {
      if (element.includes(word)) {
        found = true;
        return true;
      }
    });
    return found;
  }
};
