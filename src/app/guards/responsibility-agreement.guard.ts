import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { ResponsibilityAgreementModal } from 'src/app/pages/modals/responsibility-agreement-modal/responsibility-agreement.modal';
import { WalletsProvider } from 'src/app/providers/data/wallets.provider';

@Injectable({
  providedIn: 'root',
})
export class ResponsibilityAgreementGuard implements CanActivate {
  constructor(private modalCtrl: ModalController, private walletsProvider: WalletsProvider) {}

  async canActivate({}: ActivatedRouteSnapshot): Promise<boolean> {
    if (this.walletsProvider.masterSeedValue.bck) return true;

    const modal = await this.modalCtrl.create({
      component: ResponsibilityAgreementModal,
    });

    await modal.present();
    const { data } = await modal.onWillDismiss();
    return data;
  }
}
