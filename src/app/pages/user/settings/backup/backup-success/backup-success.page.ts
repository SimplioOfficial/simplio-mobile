import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FinalPageOptions } from 'src/app/components/layout/sio-final-page/sio-final-page.component';
import { Translate } from 'src/app/providers/translate/';
@Component({
  selector: 'backup-success-page',
  templateUrl: './backup-success.page.html',
  styleUrls: ['./backup-success.page.scss'],
})
export class BackupSuccessPage {
  private url = this.router.getCurrentNavigation().extras.state?.url;

  readonly options: FinalPageOptions = {
    title: this.$.instant(this.$.BACKUP_SUCCESS_TITLE),
    subtitle: '',
    actionText: this.$.instant(this.$.DONE),
    icon: 'checkmark-outline',
    color: 'primary',
    action: () => {
      this.router.navigateByUrl(this.url);
    },
  };

  constructor(private router: Router, private $: Translate) {}
}
