import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { LoadingController } from '@ionic/angular';

import { UtilsService } from 'src/app/services/utils.service';
import { Translate } from 'src/app/providers/translate';
import { WalletsProvider } from '../../../providers/data/wallets.provider';
import { SwipeluxProvider } from '../../../providers/swipelux/swipelux-provider.service';
import { OrderData, SwipeluxService } from '../../../services/swipelux/swipelux.service';

@Component({
  selector: 'email-verify',
  templateUrl: './email-verify.page.html',
  styleUrls: ['./email-verify.page.scss'],
})
export class EmailVerifyPage {
  code = this.router.getCurrentNavigation().extras.state.code;
  orderData: OrderData = this.router.getCurrentNavigation().extras.state.orderData;

  formField: FormGroup = this.fb.group({
    smsCode: ['', [Validators.required, Validators.minLength(5), Validators.pattern(/^[0-9]*$/)]],
  });
  enableButton = true;

  readonly inputFormat: string = '*****';

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private utils: UtilsService,
    private route: ActivatedRoute,
    private loadingCtrl: LoadingController,
    private walletProvider: WalletsProvider,
    private swipeluxService: SwipeluxService,
    private swipeluxProvider: SwipeluxProvider,
    public $: Translate,
  ) {
    console.log(42, this.code);
    this.loadingCtrl.dismiss();
  }

  get isValid(): boolean {
    return this.formField.valid;
  }

  async onSubmit() {
    this.enableButton = false;
    const { smsCode: code = null } = this.formField.value;

    const loading = await this.loadingCtrl.create({ cssClass: 'sub-cover' });
    loading.present();

    const res = await this.swipeluxService.verifyEmail(code);
    if (res.passed) {
      const address = this.walletProvider.walletsValue.find(
        a => a.ticker === this.orderData.order.to.currency,
      ).mainAddress;

      try {
        await this.swipeluxService.setAddress(address);

        this.swipeluxService.getKycToken().then(async res => {
          console.log(64, res);
          if (res.passed) {
            const orders = await this.swipeluxService.getCurrentOrders();
            console.log(67, orders);
            if (!!orders.uid) {
              const paymentData = await this.swipeluxService.initializePayment();
              console.log(70, paymentData);

              this.router.navigate(['gateway-iframe'], {
                relativeTo: this.route.parent.parent,
                state: {
                  iframeUrl: paymentData.paymentUrl,
                },
              });
            }
          } else {
            loading.dismiss();
            this.swipeluxProvider.setSumsubToken(res.token);
            await this.router.navigate(['/home', 'user', 'account', 'lock']);
          }
        });
      } catch (e) {
        console.error(84, e);
        this.utils.showToast('An error occurred, please try it later', 2000, 'warning');

        loading.dismiss();
      }
    } else {
      loading.dismiss();
      this.enableButton = true;
      return this.utils.showToast('5-digit code is not valid', 1500, 'warning');
    }
  }
}
