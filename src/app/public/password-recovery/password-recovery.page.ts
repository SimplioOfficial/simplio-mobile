import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { AccountRegistrationError } from 'src/app/providers/errors/account-registration-error';
import { Translate } from 'src/app/providers/translate/';
import { AccountService } from 'src/app/services/authentication/account.service';
import { UtilsService } from 'src/app/services/utils.service';
import { TrackedPage } from '../../classes/trackedPage';

@Component({
  selector: 'password-recovery-page',
  templateUrl: './password-recovery.page.html',
  styleUrls: ['./password-recovery.page.scss'],
})
export class PasswordRecoveryPage extends TrackedPage {
  formField: FormGroup = this.fb.group({
    email: [
      '',
      [Validators.required, Validators.pattern(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/)],
    ],
  });

  constructor(
    private router: Router,
    private loadingCtrl: LoadingController,
    private fb: FormBuilder,
    private utils: UtilsService,
    private acc: AccountService,
    public $: Translate,
  ) {
    super();
  }

  get isValid(): boolean {
    return this.formField.valid && !this._disabled;
  }

  private _disabled = false;
  get disabled(): boolean {
    return this._disabled;
  }

  async onSubmit() {
    if (this.formField.valid) {
      const { email } = this.formField.value;
      const loading = await this.loadingCtrl.create({ cssClass: 'sub-cover' });

      loading
        .present()
        .then(() => (this._disabled = true))
        .then(() => this.acc.resetPassword(email))
        .then(() => loading.dismiss())
        .then(() => this.utils.showToast(this.$.EMAIL_HAS_BEEN_SENT, 1500, 'success'))
        .then(() => this.router.navigate(['/login']))
        .catch((e: AccountRegistrationError) => {
          this.utils.showToast(e.message, 1500, e.color);
          loading.dismiss();
        })
        .then(() => (this._disabled = false));
    }
  }
}
