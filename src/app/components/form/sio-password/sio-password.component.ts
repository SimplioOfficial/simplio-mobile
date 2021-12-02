import { Component, forwardRef, Input } from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormControl,
  ValidatorFn,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';

export type PasswordOptions = {
  minLength: number;
  hasUpper: boolean;
  hasNumber: boolean;
  hasSymbol: boolean;
};

export const minHeight =
  (height: number) =>
  (val: string): boolean =>
    val.length >= height;
export const hasNumber = (val: string): boolean => /^(?=.*[0-9])/.test(val);
export const hasUpper = (val: string): boolean => /^(?=.*[A-Z])/.test(val);
export const hasSpecialChar = (val: string): boolean =>
  /^(?=.*[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~])/.test(val);
export const allowedChars = (val: string): boolean =>
  /^[a-zA-Z0-9@%+-=\/'"`!#$^?*:.(){}[\]~\-_]*$/.test(val);
export const MIN_LENGTH = 8;

export const validator =
  (fn = (_val: string) => true): ValidatorFn =>
  (c: AbstractControl) =>
    fn(c.value) ? null : { valid: false };

@Component({
  selector: 'sio-password',
  templateUrl: './sio-password.component.html',
  styleUrls: ['./sio-password.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SioPasswordComponent),
      multi: true,
    },
  ],
})
export class SioPasswordComponent implements ControlValueAccessor {
  results = {
    hasNumber: false,
    hasSymbol: false,
    hasUpper: false,
    minLength: false,
  };

  private _defaultOptions: PasswordOptions = {
    hasNumber: true,
    hasSymbol: true,
    hasUpper: true,
    minLength: MIN_LENGTH,
  };

  private _isVisible = false;
  passwordForm: FormControl = new FormControl('');

  @Input() control: AbstractControl = null;

  @Input() placeholder = '';
  @Input() autofocus = false;
  @Input() required = true;
  @Input('show-remainder') isRemainder = true;

  @Input('has-number-placeholder') hasNumberPlaceholder = '';
  @Input('has-symbol-placeholder') hasSymbolPlaceholder = '';
  @Input('has-upper-placeholder') hasUpperPlaceholder = '';
  @Input('min-length-placeholder') minLengthPlaceholder = '';

  private _inputOptions: PasswordOptions = { ...this._defaultOptions };
  @Input('options') set inputOptions(opt: Partial<PasswordOptions>) {
    this._inputOptions = {
      ...this._defaultOptions,
      ...opt,
    };
  }

  get options(): PasswordOptions {
    return this._inputOptions;
  }

  get icon(): string {
    return this._isVisible ? 'eye-off-outline' : 'eye-outline';
  }

  get inputType(): string {
    return this._isVisible ? 'text' : 'password';
  }

  registerOnChange(fn: (value: string) => void) {
    this.passwordForm.valueChanges.subscribe(val => {
      this.results.hasNumber = hasNumber(val);
      this.results.hasSymbol = hasSpecialChar(val);
      this.results.hasUpper = hasUpper(val);
      this.results.minLength = minHeight(this._inputOptions.minLength)(val);

      fn(val);

      // passing form target control as reference for
      // validator erros.
      this.passwordForm.setErrors(this?.control?.errors ?? null);
    });
  }

  registerOnTouched() {}
  setDisabledState() {}

  toggleVisibility() {
    this._isVisible = !this._isVisible;
  }

  writeValue(value: string) {
    console.log('Write value', value);
    this.passwordForm.setValue(value);
  }
}
