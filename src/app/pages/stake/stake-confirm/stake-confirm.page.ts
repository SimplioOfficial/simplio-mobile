import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Translate } from 'src/app/providers/translate/';
import { FinalPageOptions } from 'src/app/components/layout/sio-final-page/sio-final-page.component';

@Component({
  selector: 'stake-confirm-page',
  templateUrl: './stake-confirm.page.html',
})
export class StakeConfirmPage {

  options: FinalPageOptions = {
    title: this.$.instant(this.$.STAKE_SUCCESS_TITLE),
    actionText: this.$.instant(this.$.DONE),
    icon: 'checkmark-outline',
    color: 'primary',
    action: () => this.onDone(),
  };

  constructor(
    private router: Router,
    public $: Translate,
  ) {}

  onDone() {
    this.router.navigate(['/home', 'swap']);
  }
}
