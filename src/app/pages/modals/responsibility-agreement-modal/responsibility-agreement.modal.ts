import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Action } from 'src/app/components/list-items/sio-action-item/sio-action-item.component';
import { Translate } from 'src/app/providers/translate/';
import { MultiFactorAuthenticationService } from 'src/app/services/authentication/mfa.service';

@Component({
  selector: 'responsibility-agreement-modal',
  templateUrl: './responsibility-agreement.modal.html',
  styleUrls: ['./responsibility-agreement.modal.scss'],
})
export class ResponsibilityAgreementModal {
  private _isBackedAction: Action = {
    title: this.$.instant(this.$.ACTION_BACKUP_TITLE),
    subtitle: this.$.instant(this.$.ACTION_BACKUP_DESC),
    icon: 'lock-open-outline',
    color: 'primary',
    handler: () => this._handler(),
  };
  actions = [this._isBackedAction];

  constructor(
    private router: Router,
    private mfa: MultiFactorAuthenticationService,
    private modalCtrl: ModalController,
    public $: Translate,
  ) {}

  private async _handler() {
    await this.onSubmit(false);
    const modal = await this.mfa.showIdentityVerificationModal({
      fullScreen: true,
      attempts: 3,
      warnAt: 2,
    });

    const {
      data: {
        result: [isVerified],
      },
    } = await modal.onWillDismiss();

    if (!isVerified) return;
    else return this.backup();
  }

  async onSubmit(state: boolean) {
    await this.modalCtrl.dismiss(state);
  }

  backup() {
    this.router.navigate(['/home', 'user', 'settings', 'backup']);
    this.onSubmit(false);
  }
}
