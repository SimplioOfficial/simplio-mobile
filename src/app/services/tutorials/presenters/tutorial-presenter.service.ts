import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ComponentRef } from '@ionic/core/dist/types/interface';

export type Component = ComponentRef;
export type PresenterParams = {
  tutorial: boolean;
  component: Component;
};

export interface TutorialPresenter {
  create(component: Component): Promise<void>;
}

@Injectable({
  providedIn: 'root',
})
export class TutorialPresenterService {
  constructor(private modalCtrl: ModalController) {}

  async create(options: PresenterParams): Promise<boolean> {
    if (options.tutorial) throw new Error();
    else return await this._openModal(options);
  }

  private async _openModal(options: PresenterParams): Promise<boolean> {
    const modal = await this.modalCtrl.create({
      component: options.component,
    });

    await modal.present();
    const { data } = await modal.onWillDismiss();

    return data;
  }
}
