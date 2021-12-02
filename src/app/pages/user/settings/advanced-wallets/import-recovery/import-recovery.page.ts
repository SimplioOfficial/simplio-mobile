import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Translate } from 'src/app/providers/translate';

@Component({
  selector: 'import-recovery-page',
  templateUrl: './import-recovery.page.html',
})
export class ImportRecoveryPage {
  constructor(private router: Router, private route: ActivatedRoute, public $: Translate) {}

  dismiss() {
    this.router.navigate(['..'], {
      relativeTo: this.route.parent,
    });
  }
}
