import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

import { Wallet } from '../interface/data';
import { AuthenticationProvider } from '../providers/data/authentication.provider';
import { WalletsProvider } from '../providers/data/wallets.provider';
import { WalletService } from '../services/wallet.service';
import { DefaultWalletService } from 'src/app/services/wallets/default-wallets.service';
import { NetworkService } from '../services/apiv2/connection/network.service';
import { isSolanaToken } from '../services/utils.service';

@Injectable()
export class AccountWalletsResolver implements Resolve<Wallet[]> {
  constructor(
    private authProvider: AuthenticationProvider,
    private walletsProvider: WalletsProvider,
    private walletService: WalletService,
    private dw: DefaultWalletService,
    private networkService: NetworkService,
  ) {}

  async resolve(): Promise<Wallet[]> {
    const account = this.authProvider.accountValue;
    const wallets = this.walletService.matchWallets({ uid: account.uid });
    const [hasMissing, wds] = this.dw.getWallets(account, wallets);

    const noTokenAddress = wallets.filter(e => !e.tokenAddress && isSolanaToken(e.type));
    if (noTokenAddress.length > 0) {
      for (const element of noTokenAddress) {
        const addr = await this.walletService.getTokenAddress({
          type: element.type,
          contractAddress: element.contractaddress,
          address: element.mainAddress,
        });
        element.tokenAddress = addr.toString();
        await this.walletService.updateWallet(element._uuid, element, false);
      }
    }
    if (hasMissing) {
      await this.networkService.getNetworks();
      this.walletsProvider.pushMissingWallets(wds);
    }

    return this.walletsProvider.pushWallets(wallets);
  }
}
