import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

type Action = {
  title: string;
  icon: string;
  cssClass: string[];
  handler: (() => any) | (() => Promise<any>);
};
export type ActionsModalProps = Array<Action>;

@Component({
  selector: 'actions-modal',
  templateUrl: './actions.modal.html',
  styleUrls: ['./actions.modal.scss'],
})
export class ActionsModal {
  @Input() actions: ActionsModalProps = [];

  constructor(private modalCtr: ModalController) {}

  async onSelect(action: Action) {
    try {
      await action.handler();
    } catch (error) {
      console.error(error);
    } finally {
      this.modalCtr.dismiss();
    }
  }
}
