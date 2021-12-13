import { Component, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { DataService } from 'src/app/services/data.service';
import { parseError, pipeAmount, UtilsService } from 'src/app/services/utils.service';
import { Rate, FeeResponse, FeeName, WalletsData } from 'src/app/interface/data';
import { Wallet } from 'src/app/interface/data';
import { TransactionWalletsModal } from 'src/app/pages/modals/transaction-wallets-modal/transaction-wallets.modal';
import { SioValueComponent } from 'src/app/components/form/sio-value/sio-value.component';
import { SettingsProvider } from 'src/app/providers/data/settings.provider';
import { AuthenticationProvider } from 'src/app/providers/data/authentication.provider';
import { WalletsProvider } from 'src/app/providers/data/wallets.provider';
import { isGreaterThan, isLowerThan } from 'src/shared/validators';
import { Translate } from 'src/app/providers/translate/';
import { getPrice } from 'src/app/services/wallets/utils';
import { RateService } from 'src/app/services/apiv2/connection/rate.service';
import { Feev2Service } from 'src/app/services/apiv2/connection/feev2.service';
import { SioNumpadComponent } from 'src/app/components/form/sio-numpad/sio-numpad.component';
import { TrackedPage } from '../../classes/trackedPage';
import { IoService } from 'src/app/services/io.service';
import { BackendService } from 'src/app/services/apiv2/blockchain/backend.service';
import { StakeTransactionData } from 'src/app/providers/transactions/stake-transaction-data';
import { filter } from 'rxjs/operators';
import { Pool } from '@simplio/backend/interface/stake';

type RouteData = {
  wallets: WalletsData;
};

@Component({
  selector: 'stake',
  templateUrl: './stake.page.html',
  styleUrls: ['./stake.page.scss'],
})
export class StakePage extends TrackedPage implements OnDestroy {
  private _wallets: Wallet[] = [];

  readonly numTypes = SioNumpadComponent.TYPES;
  private _originUrl = this.router.getCurrentNavigation().extras.state?.origin || '/home/wallets';

  rate = 0;
  isMax = false;
  currency = this.settingsProvider.settingsValue.currency;
  locale = this.settingsProvider.settingsValue.language;
  feePolicy = this.settingsProvider.settingsValue.feePolicy;

  @ViewChild(SioValueComponent) valueComponent: SioValueComponent;

  formField: FormGroup = this.fb.group(
    {
      wallet: [null, [Validators.required]],
      amount: [0, [Validators.required, isGreaterThan(0), this._validateSuficiencty.bind(this)]],
    },
    {
      validators: [isLowerThan],
    },
  );

  private _routeData = this.route.data
    .pipe(filter(d => !!d))
    .subscribe(this._onRouteDataSubscription.bind(this));

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private settingsProvider: SettingsProvider,
    private utilsService: UtilsService,
    private rateService: RateService,
    private dataService: DataService,
    public $: Translate,
  ) {
    super();
  }

  get selectedWallet(): Wallet {
    return this.formField?.get('wallet')?.value ?? null;
  }

  get selectedFiat(): number {
    if (!this.selectedWallet) return;
    const { balance, ticker, type, decimal } = this.selectedWallet;
    return pipeAmount(balance, ticker, type, decimal, true) * this.rate;
  }

  ngOnDestroy(): void {
    this._routeData.unsubscribe();
  }

  private _onRouteDataSubscription({ wallets: w }: RouteData) {
    this._wallets = w.wallets;
    this.formField.patchValue({ wallet: w.primaryWallet });
  }

  onAmountChange(value: number) {
    this.valueComponent.updateInputValue(value);
  }

  onMaxClick(value: boolean) {
    this.isMax = value;
  }

  async onSubmit() {
    const { amount } = this.formField.value;

    try {
      await this.router.navigate(['summary'], { 
        relativeTo: this.route,
        state: {
          stakeData: new StakeTransactionData(this.selectedWallet, amount),
        }
      });
    } catch (err) {
        this.utilsService.showToast(parseError(err.message), 3000, 'warning');
    }

  }

  private _presentModal(modal, props = {}): Promise<HTMLIonModalElement> {
    return this.modalCtrl
      .create({
        component: modal,
        componentProps: props,
      })
      .then(modal => {
        modal.present();
        return modal;
      });
  }

  async openSelectWalletModal() {
    const modal = await this._presentModal(TransactionWalletsModal, {
      wallets: this._wallets.filter(w => w !== this.selectedWallet),
      currency: this.currency
    });
    modal
      .onWillDismiss()
      .then(({ data: wallet }) => {
        if (wallet && this.selectedWallet != wallet) {
          this.rate = getPrice(this.rateService.rateValue, wallet.ticker, this.currency);
          this.formField.patchValue({ wallet});
        }
      })
      .catch(_ => this.utilsService.showToast(this.$.WALLET_COULD_NOT_BE_SELECTED, 2000, 'warning'));
  }

  private _validateSuficiencty(c: FormControl): Validators {
    return Validators.max(this.selectedWallet?.balance || 0)(c);
  }

  getPrice(rates: Rate[], ticker: string, currency: string): number {
    return getPrice(rates, ticker, currency);
  }

  async cancelTransaction() {
    this.router.navigateByUrl(this._originUrl);
    this.dataService.cleanTransaction();
  }

}
