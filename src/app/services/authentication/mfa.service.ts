import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { VerifyIdentityModal } from 'src/app/pages/modals/verify-identity-modal/verify-identity.modal';
import { AuthenticationProvider } from 'src/app/providers/data/authentication.provider';
import { IoService } from 'src/app/services/io.service';
import { Acc, IdentityVerificationLevel } from 'src/app/interface/user';
import { WalletsProvider } from 'src/app/providers/data/wallets.provider';
import { equalPin } from './utils';
import { datedUUID } from '../utils.service';
import { AccountService } from './account.service';
import { ComapreFnDefault } from './types';

export interface IdentityVerificationModalProps {
  closable: boolean;
  limited: boolean;
  attempts: number;
  warnAt: number;
  biometrics: boolean;
  fullScreen: boolean;
  verificationLevel: IdentityVerificationLevel;
  animated: boolean;
  compareFn?: ComapreFnDefault;
}

@Injectable({
  providedIn: 'root',
})
export class MultiFactorAuthenticationService {
  constructor(
    private modalCtrl: ModalController,
    private io: IoService,
    private acc: AccountService,
    private authProvider: AuthenticationProvider,
    private walletsProvider: WalletsProvider,
  ) {}

  async showIdentityVerificationModal(
    props: Partial<IdentityVerificationModalProps>,
  ): Promise<HTMLIonModalElement> {
    const id = datedUUID();
    const acc = this.authProvider.accountValue;

    const componentProps: IdentityVerificationModalProps = {
      closable: true,
      fullScreen: false,
      limited: true,
      warnAt: 3,
      biometrics: false,
      verificationLevel: acc?.lvl ?? IdentityVerificationLevel.PIN,
      attempts: 10,
      animated: false,
      compareFn: (pin: string) => [equalPin(acc?.idt, pin), pin],
      ...props,
    };

    const modal = await this.modalCtrl.create({
      component: VerifyIdentityModal,
      componentProps: { id, ...componentProps },
      animated: componentProps.animated,
      backdropDismiss: false,
      mode: 'ios',
      id,
      cssClass: [props.fullScreen && 'full-screen', 'covered'],
    });

    await modal.present();

    return modal;
  }

  comparePin(value: string, key: string): [boolean, string] {
    const unlocked = this.io.decrypt(value, key);
    return [unlocked === key, key];
  }

  updatePin(pin: string): Promise<Acc> {
    const msed = this.walletsProvider.masterSeedValue;
    const wallets = this.walletsProvider.walletsValue;

    return Promise.all([
      this.io.updateMasterSeed(msed, pin),
      this.io.updateWallets(wallets, pin),
      this.acc.updateAccount({ idt: pin }, { alog: true, reset: false, secret: pin }),
    ])
      .then(([_, __, acc]) => acc)
      .catch(err => {
        console.error(err);
        throw err;
      });
  }
}
