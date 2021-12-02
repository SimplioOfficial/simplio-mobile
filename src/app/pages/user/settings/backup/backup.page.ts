import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Translate } from 'src/app/providers/translate/';

@Component({
  selector: 'backup-page',
  templateUrl: './backup.page.html',
})
export class BackupPage {
  private _origin = this.router.getCurrentNavigation().extras?.state?.url;

  constructor(private router: Router, private route: ActivatedRoute, public $: Translate) {}

  back() {
    if (this._origin) this.router.navigateByUrl(this._origin);
    else {
      this.router.navigate(['..'], {
        relativeTo: this.route.parent,
      });
    }
  }
}
