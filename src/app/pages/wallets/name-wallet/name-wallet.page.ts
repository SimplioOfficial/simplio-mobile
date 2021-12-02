import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { filter, tap } from 'rxjs/operators';
import { Rate, SeedType, WalletType } from 'src/app/interface/data';
import { AddCoinOptionsModal } from 'src/app/pages/modals/add-coin-options-modal/add-coin-options.modal';
import { AuthenticationProvider } from 'src/app/providers/data/authentication.provider';
import { WalletsProvider } from 'src/app/providers/data/wallets.provider';
import { Translate } from 'src/app/providers/translate/';
import { WalletData } from 'src/app/providers/wallets/wallet-data';
import { CoinsService } from 'src/app/services/apiv2/connection/coins.service';
import { RateService } from 'src/app/services/apiv2/connection/rate.service';
import { getCoinDerive } from 'src/app/services/apiv2/utils';
import { UtilsService } from 'src/app/services/utils.service';
import { WalletService } from 'src/app/services/wallet.service';
import { CheckWalletsService } from 'src/app/services/wallets/check-wallets.service';
import { CreateWalletService } from 'src/app/services/wallets/create-wallets.service';

type RouterState = {
  advanced: boolean;
  url: string;
  type: WalletType;
};
export type NameWalletPageRouterState = Partial<RouterState> & {
  name: string;
};

@Component({
  selector: 'name-wallet-page',
  templateUrl: './name-wallet.page.html',
  styleUrls: ['./name-wallet.page.scss'],
})
export class NameWalletPage implements OnDestroy {
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

  recoverySeed = '';
  selectedCoin;
  isCreated = false;

  formField: FormGroup;

  account = this.authProvider.accountValue;
  coins$ = this.coinsService.coinsData$.pipe(
    tap(coinsData => {
      this.selectedCoin = coinsData.find(
        c =>
          c.ticker.toLowerCase() === this._ticker.toLowerCase() &&
          c.type === this._rourerState.type,
      );

      this.formField = this.fb.group({
        name: [this.selectedCoin.name, [Validators.required, Validators.minLength(1)]],
        seedType: [SeedType.BIP44, [Validators.required]],
        derivationPath: [getCoinDerive(this._ticker, this._rourerState.type)],
        recoverySeed: [''],
      });
    }),
  );

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
    private rateService: RateService,
    private coinsService: CoinsService,
    private checker: CheckWalletsService,
  ) {
    const rateSubscription = this.rateService.rate$
      .pipe(filter(r => !!r))
      .subscribe(this._onRateSubscription.bind(this));
    this._subscription.add(rateSubscription);
    this._subscription.add(this.coins$.subscribe());
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

    const { name, derivationPath, recoverySeed } = this.formField.value;

    const wallets = this.walletsProvider.walletsValue;
    const alreadyExists = wallets.findIndex(w => w.name === name);
    if (alreadyExists > -1) {
      await loading.dismiss();
      return this.utils.showToast(this.$.WALLET_WITH_THE_SAME_NAME_ALREADY_EXISTS, 1500, 'warning');
    }

    const wallet = new WalletData(this.account)
      .setType(this.selectedCoin.type)
      .setTicker(this.selectedCoin.ticker)
      .setPositionIn(this.walletsProvider.walletsValue)
      .setName(name);

    if (recoverySeed !== undefined && recoverySeed !== '') {
      const r = recoverySeed.toLowerCase();
      wallet.setMnemo(r);
    } else {
      wallet.setMnemo(this.walletsProvider.masterSeedValue.sed);
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
    const { seedType, derivationPath, recoverySeed } = this.formField.value;

    const modal = await this.modalCtl.create({
      component: AddCoinOptionsModal,
      componentProps: {
        form: { seedType, derivationPath, recoverySeed },
      },
    });

    await modal.present();

    modal.onWillDismiss().then(this._onModalDismiss.bind(this));
  }

  get isValid(): boolean {
    return this.formField.valid;
  }

  private _onModalDismiss({ data }) {
    const { seedType, derivationPath, recoverySeed } = data.form;
    this.recoverySeed = recoverySeed;
    this.formField.patchValue({ seedType });
    this.formField.patchValue({ derivationPath });
    this.formField.patchValue({ recoverySeed });
  }

  back() {
    this.router.navigateByUrl(this._rourerState.url);
  }
}
