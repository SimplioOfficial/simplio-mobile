import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { LoadingController } from '@ionic/angular';

import { UtilsService } from 'src/app/services/utils.service';
import { Translate } from 'src/app/providers/translate';
import { AuthenticationProvider } from 'src/app/providers/data/authentication.provider';
import { SwipeluxProvider } from '../../../providers/swipelux/swipelux-provider.service';
import { SwipeluxService } from '../../../services/swipelux/swipelux.service';

@Component({
  selector: 'phone-verify',
  templateUrl: './phone-verify.page.html',
  styleUrls: ['./phone-verify.page.scss'],
})
export class PhoneVerifyPage {
  code = this.router.getCurrentNavigation().extras.state.code;
  orderData = this.router.getCurrentNavigation().extras.state.orderData;

  formField: FormGroup = this.fb.group({
    smsCode: ['', [Validators.required, Validators.minLength(5), Validators.pattern(/^[0-9]*$/)]],
  });
  canResend = true;
  enableButton = true;

  readonly inputFormat: string = '*****';

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private utils: UtilsService,
    private route: ActivatedRoute,
    private loadingCtrl: LoadingController,
    private swipeluxService: SwipeluxService,
    private swipeluxProvider: SwipeluxProvider,
    private authProvider: AuthenticationProvider,
    public $: Translate,
  ) {
    console.log(38, this.code);
    this.loadingCtrl.dismiss();
  }

  get isValid(): boolean {
    return this.formField.valid;
  }

  resendSmsVerificationCode() {
    this.canResend = false;
    this.swipeluxProvider.setAuthToken('');
    this.swipeluxService.createOrderAndAuthenticateUser(this.orderData).then(res => {
      this.swipeluxProvider.setAuthToken(res.token);
      this.code = res.code;

      console.log(52, this.code);
    });
  }

  async onSubmit() {
    this.enableButton = false;
    const { smsCode: code = null } = this.formField.value;

    const loading = await this.loadingCtrl.create({ cssClass: 'sub-cover' });
    loading.present();

    this.swipeluxService
      .verifyPhone(code)
      .catch(e => {
        console.error(e);
        this.utils.showToast('An error occurred, please try it later', 2000, 'warning');

        loading.dismiss();

        return { passed: false };
      })
      .then(res => {
        console.log(57, res);
        if (res.passed) {
          this.swipeluxService.setEmail(this.authProvider.accountValue.email).then(res =>
            this.router.navigate(['email-verify'], {
              relativeTo: this.route.parent.parent,
              state: {
                code: res.code,
                orderData: this.orderData,
              },
            }),
          );
        } else {
          loading.dismiss();
          this.utils.showToast('5-digit code is not valid', 1500, 'warning');
          this.enableButton = true;
        }
      });
  }
}
