import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Translate } from 'src/app/providers/translate';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

const SMS_CODE = 'smsCode';

@Component({
  selector: 'verify-sms',
  templateUrl: './verify-sms.modal.html',
  styleUrls: ['./verify-sms.modal.scss'],
})
export class VerifySmsModal implements OnInit {
  constructor(private modalCtrl: ModalController, private fb: FormBuilder, public $: Translate) {}

  get isValid(): boolean {
    return this.formField.valid;
  }

  get buttonText() {
    return !!this.button ? this.button : this.$.VERIFY;
  }
  @Input() title = '';
  @Input() subtitle: string;
  @Input() button = '';
  @Input() smsFormat = '****-****';
  @Input() smsSeparator = '-';
  @Input() smsPattern: RegExp = /^[0-9]*$/;
  @Input() accessToken: string;

  formField: FormGroup = this.fb.group({
    [SMS_CODE]: [''],
  });
  @Input() action: (smsCode: string, authToken: string) => Promise<any> = () => Promise.resolve();

  ngOnInit() {
    const len = this.smsFormat.split(this.smsSeparator).join('').length;
    this.formField
      .get(SMS_CODE)
      .setValidators([
        Validators.required,
        Validators.minLength(len),
        Validators.maxLength(len),
        Validators.pattern(this.smsPattern),
      ]);
  }

  async closeModal(result = false) {
    await this.modalCtrl.dismiss(result);
  }

  async verifySms() {
    const smsCode = this.formField.value[SMS_CODE];

    try {
      await this.action(smsCode, this.accessToken);
      await this.closeModal(true);
    } catch (err) {
      await this.closeModal(false);
    }
  }
}
