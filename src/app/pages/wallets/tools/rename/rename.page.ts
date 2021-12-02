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
  selector: 'app-rename',
  templateUrl: './rename.page.html',
  styleUrls: ['./rename.page.scss'],
})
export class RenamePage implements OnInit {
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
      newName: [this.wallet.name, [Validators.required, isNotEqual(this.wallet.name)]],
    });
  }

  back(wallet: Wallet) {
    this.router.navigate(['/home', 'wallets', wallet.name, 'overview', 'tools'], {
      state: { wallet },
    });
  }

  rename() {
    const { newName } = this.formField.value;

    const wallets = this.walletsProvider.walletsValue;
    const alreadyExists = wallets.findIndex(w => w.name === newName);

    if (alreadyExists > -1) {
      return this.utils.showToast(this.$.WALLET_WITH_THE_SAME_NAME_ALREADY_EXISTS, 1500, 'warning');
    }

    this.walletService
      .updateWallet(this.wallet._uuid, { name: newName }, false)
      .then(wallet => this.back(wallet))
      .catch(err => this.utils.showToast(err.message, 1500, 'danger'));
  }

  get isValid(): boolean {
    return this.formField.valid;
  }
}
