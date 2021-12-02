import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UtilsService } from 'src/app/services/utils.service';
import { WalletService } from 'src/app/services/wallet.service';
import { isNotEqual } from 'src/shared/validators';
import { Translate } from 'src/app/providers/translate/';
import { WalletsProvider } from 'src/app/providers/data/wallets.provider';
import { Wallet } from 'src/app/interface/data';

@Component({
  selector: 'app-decimals',
  templateUrl: './decimals.page.html',
  styleUrls: ['./decimals.page.scss'],
})
export class DecimalsPage implements OnInit {
  formField: FormGroup;
  wallet = this.router.getCurrentNavigation().extras.state as Wallet;

  constructor(
    private router: Router,
    private walletService: WalletService,
    private utils: UtilsService,
    private walletsProvider: WalletsProvider,
    private fb: FormBuilder,
    public $: Translate,
  ) {}

  ngOnInit() {
    this.formField = this.fb.group({
      newDecimals: [this.wallet.name, [Validators.required, isNotEqual(this.wallet.decimal)]],
    });
    this.formField.patchValue({ newDecimals: this.wallet.decimal });
  }

  back(wallet: Wallet) {
    this.router.navigate(['/home', 'wallets', wallet.name, 'overview', 'tools'], {
      state: { wallet },
    });
  }

  update() {
    const { newDecimals } = this.formField.value;

    this.walletService
      .updateWallet(this.wallet._uuid, { decimal: newDecimals }, false)
      .then(wallet => this.back(wallet))
      .catch(err => this.utils.showToast(err.message, 1500, 'danger'));
  }

  get isValid(): boolean {
    return this.formField.valid;
  }
}
