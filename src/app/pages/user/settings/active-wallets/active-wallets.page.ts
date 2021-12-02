import { Component } from '@angular/core';
import { Wallet } from 'src/app/interface/data';
import { WalletsProvider } from 'src/app/providers/data/wallets.provider';
import { Translate } from 'src/app/providers/translate/';
import { WalletService } from 'src/app/services/wallet.service';
import { UtilsService } from 'src/app/services/utils.service';
import { isLocked } from 'src/app/services/wallets/utils';
import { defaultWallets } from 'src/app/providers/wallets/default-wallets';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { IonicSafeString } from '@ionic/angular';

const isLockedWallet = isLocked(Object.values(defaultWallets));

@Component({
  selector: 'active-wallets-page',
  templateUrl: './active-wallets.page.html',
  styleUrls: ['./active-wallets.page.scss'],
})
export class ActiveWalletsPage {
  wallets$: Observable<Wallet[]> = this.walletsProvider.allWallets$;

  canLockDefaultWallet = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private walletsProvider: WalletsProvider,
    private wallets: WalletService,
    private utils: UtilsService,
    public $: Translate,
  ) {
    this.canLockDefaultWallet =
      this.walletsProvider.walletsValue.map(w => this.isLocked(w)).filter(w => w === true).length >
      1;
  }

  isLocked(wallet: Wallet): boolean {
    return isLockedWallet(wallet);
  }

  async toggle({ checked }, wallet: Wallet) {
    try {
      const updatedProperties = { isActive: checked };
      await this.wallets.updateWallet(wallet._uuid, updatedProperties, false);
      this.canLockDefaultWallet =
        this.walletsProvider.walletsValue.map(w => this.isLocked(w)).filter(w => w === true)
          .length > 1;
    } catch (err) {
      console.error(err);
      await this.utils.showToast(this.$.UPDATING_HAS_FAILED, 1500, 'warning');
    }
  }

  back() {
    this.router.navigate(['..'], {
      relativeTo: this.route.parent,
    });
  }

  async deleteWallet(wallet: Wallet) {
    await this.utils.presentAlert({
      header: this.$.WALLET_DELETE,
      message: [
        this.$.ARE_YOU_SURE_YOU_WANT_TO_DELETE_YOUR_WALLET,
        new IonicSafeString(wallet.name).value,
        '</strong>"? <br><br> ',
        this.$.OPERATION_IS_IRREVERSIBLE,
      ],
      buttons: [
        {
          text: this.$.NO,
          role: 'cancel',
          cssClass: 'danger',
        },
        {
          text: this.$.YES,
          handler: () => this.wallets.removeWallet(wallet),
        },
      ],
    });
  }
}
