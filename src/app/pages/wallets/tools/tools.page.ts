import { Router } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { IonicSafeString } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { UtilsService } from 'src/app/services/utils.service';
import { Wallet, WalletType } from 'src/app/interface/data';
import { WalletService } from 'src/app/services/wallet.service';
import { IoService } from 'src/app/services/io.service';
import { AuthenticationProvider } from 'src/app/providers/data/authentication.provider';
import { SettingsProvider } from 'src/app/providers/data/settings.provider';
import { Translate } from 'src/app/providers/translate/';
import { Settings } from 'src/app/interface/settings';
import { WalletsProvider } from 'src/app/providers/data/wallets.provider';
import { AesService } from 'src/app/services/aes.service';

@Component({
  selector: 'app-tools',
  templateUrl: './tools.page.html',
  styleUrls: ['./tools.page.scss'],
})
export class ToolsPage implements OnInit, OnDestroy {
  // rObj;
  name: string;
  wallet: Wallet = this.router.getCurrentNavigation().extras.state?.wallet;
  settingsSubscription: Subscription;
  fileData: File = null;
  isCoin = false;
  settings: Settings;
  isRescanning = false;
  private subscription = new Subscription();

  constructor(
    private router: Router,
    private walletService: WalletService,
    private utilsService: UtilsService,
    private ioService: IoService,
    private settingsProvider: SettingsProvider,
    private authProvider: AuthenticationProvider,
    private walletsProvider: WalletsProvider,
    private io: IoService,
    public $: Translate,
  ) {
    // this.rObj = this.router.getCurrentNavigation();
  }

  ngOnInit() {
    this.name = this.wallet.name;
    this.isCoin = UtilsService.isCoin(this.wallet.type);

    const settingsSubscription = this.settingsProvider.settings$.subscribe(data => {
      if (data) {
        this.settings = data;
      }
    });

    const rescanSubscription = this.walletsProvider.rescanning$.subscribe(data => {
      if (data.uuid === this.wallet._uuid) {
        this.isRescanning = data.rescanning;
      }
    });

    this.subscription.add(settingsSubscription);
    this.subscription.add(rescanSubscription);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  addressList() {
    this.router.navigate(['home', 'wallets', this.name, 'overview', 'tools', 'addresses'], {
      state: {
        wallet: this.wallet,
      },
    });
  }

  apiChange() {
    this.router.navigate(['home', 'wallets', this.name, 'overview', 'tools', 'apiurl'], {
      state: {
        wallet: this.wallet,
      },
    });
  }

  async deleteAlert(wallet: Wallet) {
    await this.utilsService.presentAlert({
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
          handler: () => this._removeWallet(wallet),
        },
      ],
    });
  }

  fileProgress(fileInput: any) {
    this.fileData = fileInput.target.files[0] as File;
    this.preview();
  }

  preview() {
    // Show preview
    const mimeType = this.fileData.type;
    if (mimeType.match(/image\/*/) === null) {
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(this.fileData);
    reader.onload = readerEvent => {
      const dataURLToBlob = dataURL => {
        const BASE64_MARKER = ';base64,';
        if (dataURL.indexOf(BASE64_MARKER) === -1) {
          const partsTmp = dataURL.split(',');
          const contentTypeTmp = partsTmp[0].split(':')[1];
          const raw1 = partsTmp[1];

          return new Blob([raw1], { type: contentTypeTmp });
        }

        const parts = dataURL.split(BASE64_MARKER);
        const contentType = parts[0].split(':')[1];
        const raw = window.atob(parts[1]);
        const rawLength = raw.length;

        const uInt8Array = new Uint8Array(rawLength);

        for (let i = 0; i < rawLength; ++i) {
          uInt8Array[i] = raw.charCodeAt(i);
        }

        return new Blob([uInt8Array], { type: contentType });
      };

      const image = new Image();
      image.onload = () => {
        // Resize the image
        const canvas = document.createElement('canvas');
        const maxSize = 86; // TODO : pull max size from a site config
        let width = image.width;
        let height = image.height;
        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
        }
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(image, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        const resizedImage = dataURLToBlob(dataUrl);

        const reader1 = new FileReader();
        reader1.readAsDataURL(resizedImage);
        reader1.onloadend = () => {
          // this.wallet.customLogo = reader1.result;
          this.ioService.updateWallet(this.wallet);
        };
      };
      image.src = readerEvent.target.result as string;
    };
  }

  rename() {
    this.router.navigate(['home', 'wallets', this.name, 'overview', 'tools', 'rename'], {
      state: this.wallet,
    });
  }

  updateDecimals() {
    this.router.navigate(['home', 'wallets', this.name, 'overview', 'tools', 'decimals'], {
      state: this.wallet,
    });
  }

  linkedEmail() {
    this.router.navigate(['home', 'wallets', this.name, 'overview', 'tools', 'linked'], {
      state: this.wallet,
    });
  }

  rescan() {
    this.rescanAlert(this.wallet._uuid);
  }

  async rescanAlert(uuid) {
    this.utilsService.presentAlert({
      header: this.$.PLEASE_CONFIRM,
      message: this.$.DO_YOU_REALLY_WANT_TO_RESCAN,
      buttons: [
        {
          text: this.$.NO,
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => console.log('Confirm Cancel: blah'),
        },
        {
          text: this.$.YES,
          handler: () => {
            this.walletsProvider.pushRescanning(uuid, true);
            const user = this.authProvider.accountValue;
            this.walletService.rescanWallet(uuid, user);
          },
        },
      ],
    });
  }

  walletInfo() {
    this.router.navigate(['home', 'wallets', this.name, 'overview', 'tools', 'walletinfo']);
  }

  private async _removeWallet(wallet: Wallet) {
    try {
      await this.walletService.removeWallet(wallet);
      await this.router.navigate(['/home', 'wallets']);
    } catch (err) {
      console.error(err);
    }
  }
}
