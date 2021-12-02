import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { AuthenticationProvider } from 'src/app/providers/data/authentication.provider';
import { Translate } from 'src/app/providers/translate/';
import { TrackedPage } from '../../../classes/trackedPage';

@Component({
  selector: 'wallets-recovery-page',
  templateUrl: './wallets-recovery-intro.page.html',
  styleUrls: ['./wallets-recovery-intro.page.scss'],
})
export class WalletsRecoveryIntroPage extends TrackedPage {
  private _loading = new BehaviorSubject(false);
  loading$ = this._loading.asObservable();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authProvider: AuthenticationProvider,
    public $: Translate,
  ) {
    super();
  }

  private async _activate() {
    await this.router.navigate(['../../enter'], { relativeTo: this.route });
  }

  private async _ignore() {
    this._loading.next(true);
    this.authProvider.pushCanRecover(false);
    await this.router.navigate(['/home']);
  }

  async onSubmit(state: boolean) {
    return state ? await this._activate() : await this._ignore();
  }

  dismiss() {
    this.authProvider.pushAccount(null);
  }
}
