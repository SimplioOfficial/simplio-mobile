import { Component } from '@angular/core';

import { Translate } from 'src/app/providers/translate/';

@Component({
  selector: 'change-pin',
  templateUrl: './change-pin.page.html',
})
export class ChangePinPage {
  constructor(public $: Translate) {}
}
