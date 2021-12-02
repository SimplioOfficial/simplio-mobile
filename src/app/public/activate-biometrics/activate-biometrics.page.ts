import { Component } from '@angular/core';
import { AuthenticationProvider } from 'src/app/providers/data/authentication.provider';
import { Translate } from 'src/app/providers/translate/';

@Component({
  selector: 'activate-biometrics',
  templateUrl: './activate-biometrics.page.html',
})
export class ActivateBiometricsPage {
  constructor(private authProvider: AuthenticationProvider, public $: Translate) {}

  dismiss() {
    this.authProvider.pushAccount(null);
  }
}
