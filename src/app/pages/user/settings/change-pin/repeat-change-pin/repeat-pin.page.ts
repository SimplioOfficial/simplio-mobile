import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { PredefinedColors } from '@ionic/core/dist/types/interface';

import { UtilsService } from 'src/app/services/utils.service';
import { Translate } from 'src/app/providers/translate/';
import { SioPinValueComponent } from 'src/app/components/form/sio-pin-value/sio-pin-value.component';
import { MultiFactorAuthenticationService } from 'src/app/services/authentication/mfa.service';
import { environment } from 'src/environments/environment';
import { BiometricService } from 'src/app/services/authentication/biometric.service';
import { IdentityVerificationLevel } from 'src/app/interface/user';
import { AuthenticationProvider } from '../../../../../providers/data/authentication.provider';

export const PIN_CODE = 'pinCode';

class CustomError {
  constructor(public message = '', public color: PredefinedColors = 'warning') {}
}

@Component({
  selector: 'create-pin',
  templateUrl: './repeat-pin.page.html',
  styleUrls: ['./repeat-pin.page.scss'],
})
export class RepeatPinPage {
  readonly PIN_LENGTH = environment.PIN_LENGTH;
  readonly PIN_CODE_KEY = PIN_CODE;

  @ViewChild('pinEl', { static: false }) valueComponent: SioPinValueComponent;

  formField: FormGroup = this.fb.group({
    [PIN_CODE]: ['', [Validators.required, Validators.minLength(this.PIN_LENGTH)]],
  });

  private originalPin = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private utils: UtilsService,
    private mfa: MultiFactorAuthenticationService,
    private authProvider: AuthenticationProvider,
    private bio: BiometricService,
    private fb: FormBuilder,
    public $: Translate,
  ) {
    this.originalPin = this.router.getCurrentNavigation().extras.state.pin;
  }

  onAmountChange(value: number) {
    this.valueComponent.updateInputValue(value);
  }

  async onSubmit(pin: string) {
    try {
      this.valueComponent.load();
      if (!this.formField.valid) throw new CustomError(this.$.PIN_UNKNOWN_ERROR);
      if (this.originalPin !== pin) throw new CustomError(this.$.PIN_MUST_EQUAL);

      if (this.authProvider.accountValue.lvl > IdentityVerificationLevel.BIOMETRICS_OFF) {
        await this.bio
          .storeBiometricCredentialsToKeychain(pin)
          .then(async () => await this.mfa.updatePin(pin));
      } else {
        await this.mfa.updatePin(pin);
      }

      await this.router.navigate(['/home', 'user', 'settings']);
      await this.utils.showToast(this.$.PIN_CHANGED, 1500, 'success');
    } catch (err) {
      console.error(err);
      const unknownError = new CustomError(this.$.PIN_UNKNOWN_ERROR);
      const error = err instanceof CustomError ? err : unknownError;
      await this.utils.showToast(error.message, 1500, error.color);
      await this.router.navigate(['/home', 'user', 'settings']);
    }
  }
}
