import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UtilsService } from 'src/app/services/utils.service';
import { WalletService } from 'src/app/services/wallet.service';
import { isNotEqual } from 'src/shared/validators';
import { Translate } from 'src/app/providers/translate/';
import { WalletsProvider } from 'src/app/providers/data/wallets.provider';
import { Wallet } from 'src/app/interface/data';
import { SingleSwapService } from 'src/app/services/swap/single-swap.service';
import { TranslateService } from '@ngx-translate/core';
import { MultiFactorAuthenticationService } from 'src/app/services/authentication/mfa.service';

@Component({
  selector: 'app-linked',
  templateUrl: './linked.page.html',
  styleUrls: ['./linked.page.scss'],
})
export class LinkedPage implements OnInit {
  formField: FormGroup;
  wallet = this.router.getCurrentNavigation().extras.state as Wallet;
  isLinked = false;
  userId = '';
  instant = s => this.translateService.instant(s);

  constructor(
    private router: Router,
    private singleSwap: SingleSwapService,
    private fb: FormBuilder,
    public $: Translate,
    private translateService: TranslateService,
    private utilsService: UtilsService,
    private mfa: MultiFactorAuthenticationService,
  ) {}

  get getDescription() {
    return this.instant(this.$.LINK_DESCRIPTION).replace('<walletname>', this.wallet.name);
  }

  ngOnInit() {
    this.formField = this.fb.group({
      account: [`${this.instant(this.$.CHECKING)}...`],
    });
    this._getLinkedEmail();
  }

  private _getLinkedEmail() {
    this.singleSwap
      .getLinkedUser(this.wallet.mainAddress)
      .then(res => {
        this.singleSwap
          .getAccount(res.UserId)
          .then(res2 => {
            this.isLinked = true;
            this.userId = res2.Email;
            this.formField.patchValue({
              account: this.userId,
            });
          })
          .catch(_ => {
            this.formField.patchValue({
              account: `${this.instant(this.$.UNKNOWN)}`,
            });
          });
      })
      .catch(err => {
        this.isLinked = false;
        if (!err.error) {
          this.formField.patchValue({
            account: `${this.instant(this.$.UNKNOWN)}`,
          });
        } else {
          this.formField.patchValue({
            account: `${this.instant(this.$.NOT_LINKED)}`,
          });
        }
      });
  }

  back(wallet: Wallet) {
    this.router.navigate(['/home', 'wallets', wallet.name, 'overview', 'tools'], {
      state: { wallet },
    });
  }

  async unlink() {
    const modal = await this.mfa.showIdentityVerificationModal({
      fullScreen: true,
      attempts: 3,
      warnAt: 2,
    });

    const {
      data: {
        result: [isVerified],
      },
    } = await modal.onWillDismiss();

    if (isVerified) {
      this.isLinked = false;
      return this.singleSwap
        .unlinkAddress(this.wallet.mainAddress)
        .then(_ => this._getLinkedEmail())
        .catch(err => {
          if (err.status === 400) {
            this.utilsService.showToast(this.$.UNLINK_NO_PERMISSION, 3000, 'warning');
          } else {
            this.utilsService.showToast(this.$.UNLINK_FAILED, 3000, 'warning');
          }
        });
    }

    this.utilsService.showToast(this.$.INCORRECT_PIN, 3000, 'warning');
  }

  get isValid(): boolean {
    return this.formField.valid;
  }
}
