import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UtilsService } from 'src/app/services/utils.service';
import { fillString, Translate } from 'src/app/providers/translate';
import { compareValues } from 'src/shared/validators';
import { AccountService } from 'src/app/services/authentication/account.service';
import { AccountRegistrationError } from 'src/app/providers/errors/account-registration-error';
import {
  validator,
  hasNumber,
  hasSpecialChar,
  hasUpper,
  minHeight,
  MIN_LENGTH,
  allowedChars,
} from 'src/app/components/form/sio-password/sio-password.component';
import { LoadingController } from '@ionic/angular';
import { AuthenticationService } from '../../../../services/authentication/authentication.service';

@Component({
  selector: 'change-pass',
  templateUrl: './change-pass.page.html',
  styleUrls: ['./change-pass.page.scss'],
})
export class ChangePasswordPage {
  minLengthText = fillString(this.$.instant(this.$.PASSWORD_REQUIRE_LENGTH), ['AMOUNT', 8]);
  formField: FormGroup = this.fb.group(
    {
      passwordOld: ['', [Validators.required]],
      passwordNew: [
        '',
        [
          validator(hasNumber),
          validator(hasSpecialChar),
          validator(hasUpper),
          validator(minHeight(MIN_LENGTH)),
          validator(allowedChars),
        ],
      ],
    },
    {
      validators: [compareValues(['passwordOld', 'passwordNew'], false)],
    },
  );

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private utils: UtilsService,
    private loadingCtrl: LoadingController,
    private auth: AuthenticationService,
    private acc: AccountService,
    public $: Translate,
  ) {}

  async updatePassword() {
    const loading = await this.loadingCtrl.create();
    try {
      const { passwordOld, passwordNew } = this.formField.value;
      await loading.present();

      if (await this.auth.checkPassword(passwordOld)) {
        this.acc
          .changePassword(passwordNew)
          .then(() => this.router.navigate(['/home', 'user', 'settings']))
          .then(() => this.utils.showToast(this.$.PASSWORD_CHANGED, 1500, 'success'))
          .catch((e: AccountRegistrationError) => this.utils.showToast(e.message, 1500, e.color));
      }
    } catch (err) {
      this.utils.showToast(this.$.SOMETHING_WENT_WRONG, 1500, 'warning');
    } finally {
      await loading.dismiss();
    }
  }
}
