import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ActionsModal } from './actions.modal';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule],
  declarations: [ActionsModal],
  exports: [ActionsModal],
  bootstrap: [ActionsModal],
})
export class ActionsModalModule {}
