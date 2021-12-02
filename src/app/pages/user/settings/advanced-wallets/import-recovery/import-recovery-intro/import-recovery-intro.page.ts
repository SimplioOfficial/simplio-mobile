import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Translate } from 'src/app/providers/translate/';

@Component({
  selector: 'import-recovery-page',
  templateUrl: './import-recovery-intro.page.html',
  styleUrls: ['./import-recovery-intro.page.scss'],
})
export class ImportRecoveryIntroPage {
  constructor(private router: Router, private route: ActivatedRoute, public $: Translate) {}

  async onSubmit() {
    return this.router.navigate(['../enter'], {
      relativeTo: this.route.parent,
    });
  }

  dismiss() {
    this.router.navigate(['..'], {
      relativeTo: this.route.parent,
    });
  }
}
