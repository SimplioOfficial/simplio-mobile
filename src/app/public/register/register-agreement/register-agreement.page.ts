import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Browser } from '@capacitor/browser';
import { LoadingController } from '@ionic/angular';
import { AccountRegistrationItem } from 'src/app/interface/account';
import { AuthenticationProvider } from 'src/app/providers/data/authentication.provider';
import { AccountRegistrationError } from 'src/app/providers/errors/account-registration-error';
import { Translate } from 'src/app/providers/translate/';
import TERMS_AND_CONDITIONS from '../../../../assets/termsAndConditions/termsAndConditions.json';
import { RegistrationService } from 'src/app/services/authentication/registration.service';
import { UtilsService } from 'src/app/services/utils.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'register-agreement-page',
  templateUrl: './register-agreement.page.html',
  styleUrls: ['./register-agreement.page.scss'],
})
export class RegisterAgreementPage {
  TERMS_AND_CONDITIONS;

  private _routeState = this.router.getCurrentNavigation().extras.state as AccountRegistrationItem;

  readonly AGREEMENT = 'AGREEMENT';
  readonly MARKETING = 'MARKETING';

  formField = this.fb.group({
    [this.AGREEMENT]: [false, Validators.requiredTrue],
    [this.MARKETING]: [false],
  });

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private registration: RegistrationService,
    private loadingCtrl: LoadingController,
    private authProvider: AuthenticationProvider,
    private sanitizer: DomSanitizer,
    private utils: UtilsService,
    private fb: FormBuilder,
    public $: Translate,
  ) {
    this.TERMS_AND_CONDITIONS = this.sanitizer.bypassSecurityTrustHtml(TERMS_AND_CONDITIONS.text);
  }

  onSubmit(state: boolean) {
    if (state) {
      return this._register();
    } else {
      return this.authProvider.pushAccount(null);
    }
  }

  async openBrowser() {
    await Browser.open({
      url: 'https://simplio.io/terms-of-service',
    });
  }

  get isValid(): boolean {
    return this.formField.valid;
  }

  private async _register() {
    const loading = await this.loadingCtrl.create();
    await loading.present();

    const ipAddress = await this.registration.getIpAddress();

    const data = {
      agreements: {
        termsAndConditionsAgreedVersion: TERMS_AND_CONDITIONS.version,
        date: new Date().toDateString(),
        ipAddress,
        advertising: this.formField.get(this.MARKETING).value,
      },
      cred: {
        userId: this._routeState.email,
        email: this._routeState.email,
        password: this._routeState.password,
      },
    };

    this.registration
      .register(data)
      .then(async res =>
        this.router.navigate(['../../verify'], {
          relativeTo: this.route,
          state: { response: res, agreements: data.agreements },
        }),
      )
      .catch((err: AccountRegistrationError) => {
        this.utils.showToast(err.message, 1500, err.color);
        this.authProvider.pushAccount(null);
      })
      .then(() => loading.dismiss());
  }
}
