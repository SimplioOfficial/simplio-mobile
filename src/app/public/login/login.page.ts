import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingController } from '@ionic/angular';
import { PlatformProvider } from 'src/app/providers/platform/platform';
import { Translate } from 'src/app/providers/translate/';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { UtilsService } from 'src/app/services/utils.service';
import { TrackedPage } from '../../classes/trackedPage';

const loadingConfig = {
  cssClass: ['sub-cover', 'loading--full'],
  animated: false,
};

@Component({
  selector: 'login-page',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage extends TrackedPage {
  formField: FormGroup = this.fb.group({
    email: [
      '',
      [Validators.required, Validators.pattern(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/)],
    ],
    password: ['', Validators.required],
  });

  private _loading: HTMLIonLoadingElement = null;
  isConnected$ = this.plt.isConnected$;
  constructor(
    private loadingCtrl: LoadingController,
    private fb: FormBuilder,
    private utilsService: UtilsService,
    private auth: AuthenticationService,
    public $: Translate,
    private plt: PlatformProvider,
  ) {
    super();
  }

  get isValid(): boolean {
    return this.formField.valid;
  }

  ionViewDidLeave() {
    this._loading?.dismiss();
  }

  async onSubmit() {
    try {
      this._loading = await this.loadingCtrl.create(loadingConfig);
      await this._loading.present();
      const { email, password } = this.formField.value;
      await this.auth.login({ email, password, userId: email }, { isNew: true });
    } catch (err) {
      this._onLoginFail(err);
    }
  }

  private async _onLoginFail(err) {
    await this._loading.dismiss();

    // console.log('SOMETHING IS WRONG HERE', err);

    // const isErrType = err instanceof IdentityVerificationError;
    // if (!isErrType || !err.message) return;
    // if (!err.code) return;
    await this.utilsService.showToast(
      `Incorrect email or password (${err.status})`,
      1500,
      'warning',
    );
  }
}
