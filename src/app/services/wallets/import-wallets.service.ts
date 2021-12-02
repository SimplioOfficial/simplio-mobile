import { Injectable } from '@angular/core';
import { AddressType, Wallet } from 'src/app/interface/data';
import { Acc } from 'src/app/interface/user';
import { AuthenticationProvider } from 'src/app/providers/data/authentication.provider';
import { WalletsProvider } from 'src/app/providers/data/wallets.provider';
import { WalletData } from 'src/app/providers/wallets/wallet-data';
import { IoService } from 'src/app/services/io.service';
import { WalletsCreator } from 'src/app/services/wallet.service';

@Injectable({
  providedIn: 'root',
})
export class ImportWalletService implements WalletsCreator {
  constructor(
    private io: IoService,
    private authProvider: AuthenticationProvider,
    private walletsProvider: WalletsProvider,
  ) {}

  async createWallet(walletData: WalletData): Promise<Wallet> {
    let mnemo;
    const mainxp = null;
    let mainAddress;

    const { coin } = walletData.value();
    const msed = this.walletsProvider.masterSeedValue;
    const acc = this.authProvider.accountValue;

    try {
      mnemo = this.io.decrypt(msed.sed, acc.idt);
      // mainAddress = this.api.getAddress(walletData.value(), mainxp, 0);
    } catch (err) {
      throw err;
    }

    walletData.setPositionIn(this.walletsProvider.walletsValue).setMnemo(mnemo).pushAddress({
      address: mainAddress,
    });

    try {
      return await this.addWallet(walletData);
    } catch (err) {
      throw err;
    }
  }

  addWallet(wallet: WalletData): Promise<Wallet> {
    return this.io.addWallet(wallet.value()).then(w => {
      return w;
    });
  }
}
