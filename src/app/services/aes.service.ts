import { Injectable } from '@angular/core';
import { AES, enc } from 'crypto-ts';
import { isObject } from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class AesService {
  constructor() {}

  encryptString(text: any, pass: string) {
    let data = '';
    if (isObject(text)) {
      data = JSON.stringify(text);
    } else {
      data = text;
    }
    return AES.encrypt(data, pass.trim()).toString();
  }

  decryptString(text: any, pass: string): string {
    let data = '';
    if (isObject(text)) {
      data = JSON.stringify(text);
    } else {
      data = text;
    }
    try {
      const dec = AES.decrypt(data, pass.trim());
      return dec.toString(enc.Utf8);
    } catch (ex) {
      return undefined;
    }
  }
}
