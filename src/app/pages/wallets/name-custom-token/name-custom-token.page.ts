import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { LoadingController, ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Rate, SeedType, TokenType, WalletType } from 'src/app/interface/data';
import { AddCoinOptionsModal } from 'src/app/pages/modals/add-coin-options-modal/add-coin-options.modal';
import { AuthenticationProvider } from 'src/app/providers/data/authentication.provider';
import { WalletsProvider } from 'src/app/providers/data/wallets.provider';
import { Translate } from 'src/app/providers/translate/';
import { WalletData } from 'src/app/providers/wallets/wallet-data';
import { RateService } from 'src/app/services/apiv2/connection/rate.service';
import { UtilsService } from 'src/app/services/utils.service';
import { WalletService } from 'src/app/services/wallet.service';
import { CreateWalletService } from 'src/app/services/wallets/create-wallets.service';
import { Camera } from '@capacitor/camera';
import { customCoins } from 'src/assets/json/coinlist';
import { CheckWalletsService } from 'src/app/services/wallets/check-wallets.service';

type RouterState = {
  advanced: boolean;
  url: string;
  type: WalletType;
};
export type NameCustomTokenPageRouterState = Partial<RouterState>;

@Component({
  selector: 'name-custom-token-page',
  templateUrl: './name-custom-token.page.html',
  styleUrls: ['./name-custom-token.page.scss'],
})
export class NameCustomTokenPage implements OnDestroy {
  private _ticker = this.activatedRoute.snapshot.paramMap.get('ticker');
  private _state = this.router.getCurrentNavigation().extras?.state ?? {};
  private _subscription = new Subscription();
  private _rourerState: RouterState = {
    advanced: false,
    url: '/home/wallets',
    type: WalletType.BITCORE_ZCASHY,
    ...this._state,
  };
  private _rates: Rate[] = [];
  showAdvanced = this._rourerState.advanced;
  tokenTypes: TokenType[] = Object.values(TokenType) as TokenType[];

  coins = customCoins;
  selectedCoin = this.coins.find(
    c => c.ticker.toLowerCase() === this._ticker.toLowerCase() && c.type === this._rourerState.type,
  );

  recoverySeed = '';

  isCreated = false;

  formField = this.fb.group({
    name: [this.selectedCoin.name, [Validators.required, Validators.minLength(1)]],
    tokenType: ['', [Validators.required, Validators.minLength(1)]],
    contractAddress: ['', [Validators.required, Validators.minLength(1)]],
    decimal: [[Validators.required, Validators.minLength(1)]],
    seedType: [SeedType.BIP44, [Validators.required]],
    ticker: ['', [Validators.required, Validators.minLength(1)]],
    recoverySeed: [''],
  });

  account = this.authProvider.accountValue;

  constructor(
    private router: Router,
    private utils: UtilsService,
    private walletService: WalletService,
    private walletsProvider: WalletsProvider,
    private activatedRoute: ActivatedRoute,
    private modalCtl: ModalController,
    private authProvider: AuthenticationProvider,
    private fb: FormBuilder,
    public $: Translate,
    private loadingCtrl: LoadingController,
    private walletCreator: CreateWalletService,
    private barcodeScanner: BarcodeScanner,
    private rateService: RateService,
    private utilsService: UtilsService,
    private checker: CheckWalletsService,
  ) {
    const rateSubscription = this.rateService.rate$
      .pipe(filter(r => !!r))
      .subscribe(this._onRateSubscription.bind(this));
    this._subscription.add(rateSubscription);
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }

  private _onRateSubscription(rates: Rate[]) {
    this._rates = rates;
  }

  async addCoin() {
    const loading = await this.loadingCtrl.create({ duration: 40000 });
    await loading.present();

    const { name, recoverySeed, contractAddress, tokenType, ticker } = this.formField.value;

    const wallets = this.walletsProvider.walletsValue;
    const alreadyExists = wallets.findIndex(w => w.name === name);
    if (alreadyExists > -1) {
      await loading.dismiss();
      return this.utils.showToast(this.$.WALLET_WITH_THE_SAME_NAME_ALREADY_EXISTS, 1500, 'warning');
    }

    const wallet = new WalletData(this.account)
      .setType(this.selectedCoin.type)
      .setTicker(this.selectedCoin.ticker)
      .setAddressType(this.selectedCoin.addressType)
      .setPositionIn(this.walletsProvider.walletsValue)
      .setName(name);

    if (recoverySeed !== undefined && recoverySeed !== '') {
      const r = recoverySeed.toLowerCase();
      wallet.setMnemo(r);
    } else {
      wallet.setMnemo(this.walletsProvider.masterSeedValue.sed);
    }
    wallet.setUniqueId(-1);
    wallet.setTicker(ticker);
    wallet.setContractAddress(contractAddress);
    switch (tokenType) {
      case TokenType.SOLANA_TOKEN:
        wallet.setWalletType(WalletType.SOLANA_TOKEN);
        break;
      case TokenType.ETH_TOKEN:
        wallet.setWalletType(WalletType.ETH_TOKEN);
        break;
      case TokenType.BSC_TOKEN:
        wallet.setWalletType(WalletType.BSC_TOKEN);
        break;
      default:
        console.log('Could not find wallet type');
        break;
    }

    try {
      // @todo add support for importing wallets via WalletImporter
      await this.walletCreator.createWallet(wallet);
      this.walletService.getWalletsOf(this.account.uid);
      this.router.navigate(['/home', 'wallets']);
    } catch (err) {
      console.error(err);
      if (err.status === 404) {
        await this.utils.showToast(this.$.THERE_WAS_AN_NETWORK_ERROR, 1500, 'warning');
      } else {
        await this.utils.showToast(
          err.message ? err.message : this.$.STORING_RENAMED_WALLET_HAS_FAILED,
          1500,
          'warning',
        );
      }
    } finally {
      const lc = s => s.toLowerCase();

      if (!this._rates.find(r => lc(r.code) === lc(wallet.value().ticker))) {
        // report data to rate server
        this.rateService.pushRateServer(wallet.value().ticker);
      }
      // check new wallet
      this.checker.checkTransactions({
        wallets: [wallet.value()],
        important: true,
      });
      await loading.dismiss();
    }
  }

  async openModal() {
    const { seedType, recoverySeed } = this.formField.value;

    const modal = await this.modalCtl.create({
      component: AddCoinOptionsModal,
      componentProps: {
        form: { seedType, recoverySeed },
      },
    });

    await modal.present();

    modal.onWillDismiss().then(this._onModalDismiss.bind(this));
  }

  get isValid(): boolean {
    return this.formField.valid;
  }

  private _onModalDismiss({ data }) {
    const { seedType, recoverySeed } = data.form;
    this.recoverySeed = recoverySeed;
    this.formField.patchValue({ seedType });
    this.formField.patchValue({ recoverySeed });
  }

  back() {
    this.router.navigateByUrl(this._rourerState.url);
  }

  /**
   * Opening a Camera for QR scanning if permission is granted
   */
  openQr() {
    console.log('open qr');
    const onPermissionGranted = _ => {
      this.barcodeScanner
        .scan()
        .then(barcodeData => {
          const splt = barcodeData.text.split(':');
          this.formField.patchValue({ splt });
        })
        .catch(err => {
          console.log('Error', err);
        });
    };

    const onPermissionDenied = (err: Error) => {
      console.error(err);
    };

    this._grantCameraPermission(onPermissionGranted, onPermissionDenied);
  }

  /**
   *
   * @todo resolve a 'prompt' state for permission PWA and native
   * @note on native platform should prompt automatically
   */
  private _grantCameraPermission(onSuccess = (r: any) => {}, onError = (err: any) => {}) {
    Camera.checkPermissions().then(({ camera }) => {
      if (camera === 'granted') {
        return onSuccess(camera);
      } else {
        this.utilsService.grantCameraPermission(onSuccess, onError);
      }
    });
  }
}
