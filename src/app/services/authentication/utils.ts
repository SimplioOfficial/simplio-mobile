import { HttpHeaders } from '@angular/common/http';
import { isNumber } from 'lodash';
import { HttpService } from '../http.service';

import { CompareFnResult } from './types';

export function equalPin(value: string, key: string): boolean {
  return value === key;
}

export const getParams = data => {
  for (const k in data) {
    if (data.hasOwnProperty(k) && isNumber(data[k])) {
      data[k] = String(data[k]);
    }
  }
  return data;
};

export const getResult = <T>(result: CompareFnResult<T | any>): boolean => {
  return Array.isArray(result) ? result[0] : result;
};

export const parseJWT = <T>(token: string): T => {
  const jwtPayload = token.split('.')[1];
  return JSON.parse(atob(jwtPayload));
};

export const httpHeaders = () =>
  new HttpHeaders({
    'Content-Type': 'application/json',
  });
