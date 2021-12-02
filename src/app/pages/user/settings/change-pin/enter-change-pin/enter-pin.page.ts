import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UtilsService } from 'src/app/services/utils.service';
import { Translate } from 'src/app/providers/translate/';
import { SioPinValueComponent } from 'src/app/components/form/sio-pin-value/sio-pin-value.component';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';

export const PIN_CODE = 'pinCode';

@Component({
  selector: 'change-pin-enter',
  templateUrl: './enter-pin.page.html',
  styleUrls: ['./enter-pin.page.scss'],
})
export class EnterPinPage {
  readonly PIN_LENGTH = environment.PIN_LENGTH;
  readonly PIN_CODE_KEY = PIN_CODE;
  results: boolean[] = [];

  @ViewChild('pinEl', { static: false }) valueComponent: SioPinValueComponent;

  formField: FormGroup = this.fb.group({
    [PIN_CODE]: ['', [Validators.required, Validators.minLength(this.PIN_LENGTH)]],
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private utilsService: UtilsService,
    private fb: FormBuilder,
    public $: Translate,
  ) {}

  onAmountChange(value: number) {
    this.valueComponent.updateInputValue(value);
  }

  private resetPinCode() {
    this.valueComponent.resetInputValue();
  }

  async onSubmit(pin: string) {
    try {
      if (!this.formField.valid) throw new Error();
      this.router.navigate(['/home', 'user', 'settings', 'change-pin', 'repeat'], {
        state: { pin },
      });
    } catch (err) {
      console.error(err);
      await this.utilsService.showToast(this.$.PIN_UNKNOWN_ERROR, 1500, 'warning');
      this.resetPinCode();
    }
  }
}
