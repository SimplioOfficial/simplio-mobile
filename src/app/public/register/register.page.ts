import { Component } from '@angular/core';
import { AuthenticationProvider } from 'src/app/providers/data/authentication.provider';
import { Translate } from 'src/app/providers/translate/';
import { TrackedPage } from '../../classes/trackedPage';

@Component({
  selector: 'register-page',
  templateUrl: './register.page.html',
})
export class RegisterPage extends TrackedPage {
  constructor(private authProvider: AuthenticationProvider, public $: Translate) {
    super();
  }

  dismiss() {
    this.authProvider.pushAccount(null);
  }
}
