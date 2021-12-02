import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { LoadingController, ModalController } from '@ionic/angular';

import { Translate } from 'src/app/providers/translate';
import { SwipeluxProvider } from '../../../providers/swipelux/swipelux-provider.service';
import { CountryCode, CountryService } from '../../../services/country.service';
import { OrderData, SwipeluxService } from '../../../services/swipelux/swipelux.service';
import { UtilsService } from '../../../services/utils.service';
import { CountryListModal } from '../../modals/country-list-modal/country-list.modal';

@Component({
  selector: 'phone-number',
  templateUrl: './phone-number.page.html',
  styleUrls: ['./phone-number.page.scss'],
})
export class PhoneNumberPage implements OnInit {
  orderData: OrderData = this.router.getCurrentNavigation().extras.state.orderData;
  formField: FormGroup = this.fb.group({
    phoneCode: ['+420', [Validators.required]],
    phoneNo: [
      null,
      [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(14),
        Validators.pattern(/^[0-9]*$/),
      ],
    ],
  });

  private _phoneCodeCache: CountryCode[] = null;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private utils: UtilsService,
    private route: ActivatedRoute,
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController,
    private countryService: CountryService,
    private swipeluxService: SwipeluxService,
    private swipeluxProvider: SwipeluxProvider,
    public $: Translate,
  ) {}

  get isValid(): boolean {
    return this.formField.valid;
  }

  get phoneCode(): string {
    const { phoneCode } = this.formField.value;
    return phoneCode;
  }

  ngOnInit() {}

  /**
   *
   * @param codes
   */
  private _openPhoneCodeModal(codes: CountryCode[]) {
    this._phoneCodeCache = codes;

    this.modalCtrl
      .create({
        component: CountryListModal,
        componentProps: { codes },
      })
      .then(modal => {
        modal.present();
        return modal;
      })
      .then(modal => {
        modal.onWillDismiss().then(({ data }) => {
          if (!data || !data.code) return;
          this.formField.patchValue({ phoneCode: data.code });
        });
      });
  }

  openPhoneCodeModal() {
    const c = this._phoneCodeCache;
    if (c?.length) return this._openPhoneCodeModal(c);

    this.countryService.getPhoneCodes(this._openPhoneCodeModal.bind(this));
  }

  async onSubmit() {
    try {
      const { phoneCode = null, phoneNo = null } = this.formField.value;
      this.orderData.user.phone = `${phoneCode}${phoneNo}`;

      const loading = await this.loadingCtrl.create({ cssClass: 'sub-cover' });
      loading.present();

      await this.swipeluxService
        .createOrderAndAuthenticateUser(this.orderData)
        .then(res => {
          this.swipeluxProvider.setAuthToken(res.token);

          this.router.navigate(['phone-verify'], {
            relativeTo: this.route.parent.parent,
            state: {
              code: res.code,
              orderData: this.orderData,
            },
          });
        })
        .catch(e => {
          console.error(e);
          this.utils.showToast('An error occurred, please try it later', 2000, 'warning');

          loading.dismiss();
        });
    } catch (err) {
      console.error(err);
    }
  }
}
