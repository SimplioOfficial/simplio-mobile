import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { Translate } from 'src/app/providers/translate';
import { TrackedPage } from '../../../../classes/trackedPage';
import { FinalPageOptions } from '../../../../components/layout/sio-final-page/sio-final-page.component';
import { AuthenticationProvider } from '../../../../providers/data/authentication.provider';

@Component({
  selector: 'account-lock-final-page',
  templateUrl: './account-lock-final-page.component.html',
  styleUrls: ['./account-lock-final-page.component.scss'],
})
export class AccountLockFinalPage extends TrackedPage {
  failureOpts: FinalPageOptions = {
    title: this.$.instant(this.$.UNAVAILABLE_CONTENT),
    subtitle: this.$.instant(this.$.DISABLED_CONTENT_DESC),
    actionText: this.$.instant(this.$.GO_BACK),
    icon: 'close-outline',
    color: 'danger',
    action: () => this.router.navigate(['/home']),
  };

  constructor(
    private router: Router,
    private authProvider: AuthenticationProvider,
    public $: Translate,
  ) {
    super();

    const errMsg = this.authProvider.latestVerificationRecord.detail.moderationComment;

    if (!!errMsg) {
      this.failureOpts.title = errMsg;
    }
  }
}
