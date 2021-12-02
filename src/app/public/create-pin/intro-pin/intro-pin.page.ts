import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Translate } from 'src/app/providers/translate/';
import { environment } from 'src/environments/environment';

export const PIN_CODE = 'pinCode';

@Component({
  selector: 'create-pin-intro',
  templateUrl: './intro-pin.page.html',
  styleUrls: ['./intro-pin.page.scss'],
})
export class IntroPinPage {
  readonly PIN_LENGTH = environment.PIN_LENGTH;

  constructor(private route: ActivatedRoute, private router: Router, public $: Translate) {}

  async onSubmit() {
    await this.router.navigate(['../../enter'], { relativeTo: this.route });
  }
}
