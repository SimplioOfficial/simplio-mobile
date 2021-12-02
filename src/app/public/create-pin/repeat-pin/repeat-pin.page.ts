import { Component, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PredefinedColors } from '@ionic/core/dist/types/interface';
import { Translate } from 'src/app/providers/translate/';
import { UtilsService } from 'src/app/services/utils.service';
import { IdentityVerificationLevel } from 'src/app/interface/user';
import { AccountService } from 'src/app/services/authentication/account.service';
import { AuthenticationProvider } from 'src/app/providers/data/authentication.provider';
import { SioPinValueComponent } from 'src/app/components/form/sio-pin-value/sio-pin-value.component';
import { environment } from 'src/environments/environment';

export const PIN_CODE = 'pinCode';

class CustomError {
  constructor(public message = '', public color: PredefinedColors = 'warning') {}
}

@Component({
  selector: 'repeat-pin',
  templateUrl: './repeat-pin.page.html',
  styleUrls: ['./repeat-pin.page.scss'],
})
export class RepeatPinPage implements OnDestroy {
  readonly PIN_LENGTH = environment.PIN_LENGTH;
  readonly PIN_CODE_KEY = PIN_CODE;

  @ViewChild('pinEl', { static: false }) valueComponent: SioPinValueComponent;

  formField: FormGroup = this.fb.group({
    [PIN_CODE]: ['', [Validators.required, Validators.minLength(this.PIN_LENGTH)]],
  });

  private originalPin = '';
  private originalPin$ = this.route.data.subscribe(() => {
    this.originalPin = this.router.getCurrentNavigation().extras.state.pin;
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private utils: UtilsService,
    private authProvider: AuthenticationProvider,
    private acc: AccountService,
    private fb: FormBuilder,
    public $: Translate,
  ) {}

  ngOnDestroy() {
    this.originalPin$.unsubscribe();
  }

  onAmountChange(value: number) {
    this.valueComponent.updateInputValue(value);
  }

  onSubmit(pin: string) {
    try {
      if (!this.formField.valid) throw new CustomError(this.$.PIN_UNKNOWN_ERROR);
      if (this.originalPin !== pin) {
        this.router.navigate(['../enter'], { relativeTo: this.route.parent });
        throw new CustomError(this.$.PIN_MUST_EQUAL);
      }

      const account = this.authProvider.accountValue;
      const lvl =
        account.lvl > IdentityVerificationLevel.PIN ? account.lvl : IdentityVerificationLevel.PIN;

      this.authProvider.pushAccount({ ...account, lvl, idt: pin });
      // await this.acc.addAccount({ ...account, lvl, idt: pin });
    } catch (err) {
      console.error(err);
      const unknownError = new CustomError(this.$.PIN_UNKNOWN_ERROR);
      const error = err instanceof CustomError ? err : unknownError;
      this.utils.showToast(error.message, 1500, error.color);
    }
  }
}
