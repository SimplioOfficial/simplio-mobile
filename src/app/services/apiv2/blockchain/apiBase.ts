import { validateMnemonic, mnemonicToSeedSync } from 'bip39';
import { WalletType } from 'src/app/interface/data';
import { coinNames }from "@simplio/backend/api/utils/coins"
const bchaddr = require('bchaddrjs');

export abstract class Api {
  HIGHEST_BIT = 0x80000000;
  name: string;
  backend: any;
  lib: any;
  bitcorelibs: any[] = [];

  constructor(name: string, lib?: any) {
    this.name = name;
    this.lib = lib;
    this.init();
  }

  getName() {
    return this.name;
  }

  _isBcash(ticker: string) {
    return ticker.toUpperCase() === coinNames.BCH;
  }

  private _getAddressBitcore(data: {
    mnemo: string;
    derive: string;
    ticker: string;
    type?: WalletType;
  }): string {
    const network = this.lib.Networks.get(data.ticker.toLowerCase());
    const seed = mnemonicToSeedSync(data.mnemo);
    const split = data.derive.split('/');
    // remove first text
    split.splice(0, 1);
    let derivedByArgument = this.lib.HDPrivateKey.fromSeed(seed, network);
    split.forEach(e => {
      const numb = e.includes("'") ? Number(e.replace(/'/g, '')) + this.HIGHEST_BIT : Number(e);
      derivedByArgument = derivedByArgument.derive(numb, false, network);
    });
    const address = new this.lib.Address(derivedByArgument.publicKey, network);
    return address.toString();
  }

  // run only for bitcore and bitgo
  getAddress(data: {
    mnemo: string;
    derive: string;
    ticker: string;
    type?: WalletType;
  }): Promise<any> {
    switch (data.type) {
      case WalletType.BITCORE_ZCASHY:
        switch (data.ticker.toUpperCase()) {
          case coinNames.ZEC:
          case coinNames.BTCZ:
          case coinNames.FLUX:
          case coinNames.ZER:
          case coinNames.ZEN:
            return Promise.resolve({ address: this._getAddressBitcore(data) });
          default:
            return Promise.resolve({ address: this._getAddressBitcore(data) });
        }
      case WalletType.BITCORE_LIB:
      default:
        return Promise.resolve({ address: this._getAddressBitcore(data) });
    }
  }

  abstract init(): void;
  abstract estimatedFee(data: any): Promise<any>;
  abstract validateAddress(data: any): Promise<boolean>;
  abstract createTransaction(data: any): Promise<any>;
}
