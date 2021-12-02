import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {
  validator,
  hasNumber,
  hasSpecialChar,
  hasUpper,
  allowedChars,
  minHeight,
  MIN_LENGTH,
} from 'src/app/components/form/sio-password/sio-password.component';
import { AccountRegistrationItem } from 'src/app/interface/account';
import { fillString, Translate } from 'src/app/providers/translate/';

const PASSWORD = 'password';

@Component({
  selector: 'register-password-page',
  templateUrl: './register-password.page.html',
  styleUrls: ['./register-password.page.scss'],
})
export class RegisterPasswordPage {
  private _routeState = this.router.getCurrentNavigation().extras.state as AccountRegistrationItem;
  isClicked = false;

  readonly PASSWORD = PASSWORD;
  formField = this.fb.group({
    [this.PASSWORD]: [
      '',
      [
        validator(hasNumber),
        validator(hasSpecialChar),
        validator(hasUpper),
        validator(minHeight(MIN_LENGTH)),
        validator(allowedChars),
      ],
    ],
  });

  minLengthText = fillString(this.$.instant(this.$.PASSWORD_REQUIRE_LENGTH), ['AMOUNT', 8]);

  get isValid(): boolean {
    return this.formField.valid;
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    public $: Translate,
  ) {}

  onSubmit() {
    const state: AccountRegistrationItem = {
      ...this._routeState,
      password: this.formField.get(PASSWORD).value,
    };

    if (this.formField.valid) {
      this.router.navigate(['../../agreement'], {
        relativeTo: this.route,
        state,
      });
    }
  }
}
