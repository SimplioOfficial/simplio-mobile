import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UtilsService } from 'src/app/services/utils.service';
import { Translate } from 'src/app/providers/translate/';
import { SioPinValueComponent } from 'src/app/components/form/sio-pin-value/sio-pin-value.component';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AuthenticationProvider } from 'src/app/providers/data/authentication.provider';
import { isEqual } from 'src/shared/validators';

export const PIN_CODE = 'pinCode';

@Component({
  selector: 'change-pin-verify',
  templateUrl: './verify-pin.page.html',
  styleUrls: ['./verify-pin.page.scss'],
})
export class VerifyPinPage {
  readonly PIN_LENGTH = environment.PIN_LENGTH;
  readonly PIN_CODE_KEY = PIN_CODE;
  results: boolean[] = [];

  @ViewChild('pinEl', { static: false }) valueComponent: SioPinValueComponent;

  formField: FormGroup = this.fb.group({
    [PIN_CODE]: [
      '',
      [
        Validators.required,
        Validators.minLength(this.PIN_LENGTH),
        isEqual(this.authProvider.accountValue.idt),
      ],
    ],
  });

  constructor(
    private router: Router,
    private utilsService: UtilsService,
    private fb: FormBuilder,
    public $: Translate,
    private authProvider: AuthenticationProvider,
  ) {}

  onAmountChange(value: number) {
    this.valueComponent.updateInputValue(value);
  }

  private resetPinCode() {
    this.valueComponent.resetInputValue();
  }

  async onSubmit(pin: string) {
    try {
      if (!this.formField.valid) throw new Error(this.$.PIN_MUST_EQUAL);
      this.router.navigate(['/home', 'user', 'settings', 'change-pin', 'enter'], {
        state: { pin },
      });
    } catch (err) {
      const e = err as Error;
      await this.utilsService.showToast(e.message, 1500, 'warning');
      this.resetPinCode();
    }
  }
}
