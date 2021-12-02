import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Translate } from 'src/app/providers/translate';
import { SioPinValueComponent } from 'src/app/components/form/sio-pin-value/sio-pin-value.component';
import { IdentityVerificationLevel } from 'src/app/interface/user';
import { environment } from 'src/environments/environment';
import { BiometricService } from '../../../services/authentication/biometric.service';
import { CompareFn, CompareFnResult } from '../../../services/authentication/types';
import { getResult } from '../../../services/authentication/utils';

type ModalResult = CompareFnResult<string>;

export const PIN_CODE = 'pinCode';

@Component({
  selector: 'verify-sms',
  templateUrl: './verify-identity.modal.html',
  styleUrls: ['./verify-identity.modal.scss'],
})
export class VerifyIdentityModal implements OnInit {
  @Input() closable = false;
  @Input() limited = false;
  @Input() warnAt = 3;
  @Input() attempts: number;
  @Input() verificationLevel = IdentityVerificationLevel.PIN;
  @Input() id: string;
  @Input() compareFn: CompareFn;

  @ViewChild(SioPinValueComponent) valueComponent: SioPinValueComponent;
  results: boolean[] = [];

  readonly AUTH_METHOD = IdentityVerificationLevel;
  readonly PIN_LENGTH = environment.PIN_LENGTH;
  formField: FormGroup = this.fb.group({
    [PIN_CODE]: ['', [Validators.required, Validators.minLength(this.PIN_LENGTH)]],
  });
  private _remainingAttempts: number;
  private _selectedMethod = IdentityVerificationLevel.PIN;

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private bio: BiometricService,
    public $: Translate,
  ) {}

  get securityLevel(): IdentityVerificationLevel {
    return this._selectedMethod;
  }

  get isValid(): boolean {
    return this.formField.valid;
  }

  get result(): boolean {
    return this.results.length === 0 ? true : this.results[this.results.length - 1];
  }

  get remainingsAttempts(): number {
    return this._remainingAttempts;
  }

  ngOnInit() {
    this._remainingAttempts = this.attempts;
    this._selectedMethod = this.verificationLevel;
    if (this._selectedMethod > IdentityVerificationLevel.BIOMETRICS_OFF) this.onBio();
  }

  decreaseAttempt() {
    if (this._remainingAttempts > 0) {
      this._remainingAttempts = this._remainingAttempts - 1;
    }
  }

  async closeModal(result: ModalResult = [false, '']) {
    this.modalCtrl.dismiss({ result }, 'security', this.id);
  }

  onAmountChange(value: number) {
    this.valueComponent.updateInputValue(value);
  }

  async onBio() {
    try {
      const cred = await this.bio.getBiometricsCredentials();
      setTimeout(() => {
        if (!cred.length || cred.length < this.PIN_LENGTH) {
          return this.setMethod(IdentityVerificationLevel.PIN);
        }

        this._onResult(this.compareFn(cred));
      }, 100);
    } catch (e) {
      this.setMethod(IdentityVerificationLevel.PIN);
    }
  }

  onPin(pin: string) {
    const result = this.compareFn<string>(pin);
    const res = getResult(result);

    this.results.push(res);
    this.decreaseAttempt();

    if (this.limited) this._onLimitedAttempt(result);
    else this._onResult(result);
  }

  setMethod(meth: IdentityVerificationLevel) {
    this._selectedMethod = meth;
  }

  private _onLimitedAttempt(result: ModalResult) {
    const res = getResult(result);
    if (this._remainingAttempts > 0 && !res) {
      this.valueComponent.resetInputValue();
    } else if (this._remainingAttempts > 0 && res) {
      this.closeModal(result);
    } else {
      this.closeModal([false, '']);
    }
  }

  private _onResult(result: ModalResult) {
    const res = getResult(result);
    if (res) this.closeModal(result);
    else this._resetInputValue();
  }

  private _resetInputValue() {
    this.valueComponent?.resetInputValue();
  }
}
