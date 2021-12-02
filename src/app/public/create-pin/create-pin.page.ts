import { Component } from '@angular/core';

import { AuthenticationProvider } from 'src/app/providers/data/authentication.provider';
import { Translate } from 'src/app/providers/translate/';

@Component({
  selector: 'create-pin',
  templateUrl: './create-pin.page.html',
})
export class CreatePinPage {
  constructor(private authProvider: AuthenticationProvider, public $: Translate) {}

  dismiss() {
    this.authProvider.pushAccount(null);
  }
}
