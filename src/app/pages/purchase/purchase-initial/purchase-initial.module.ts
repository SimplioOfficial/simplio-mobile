import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { SioFormModule } from '../../../components/form/sio-form.module';
import { SioLayoutModule } from '../../../components/layout/sio-layout.module';
import { SioListModule } from '../../../components/list-items/sio-list.module';
import { TransactionPairsModal } from '../../modals/transaction-pairs-modal/transaction-pairs.modal';

import { PurchaseInitialPage } from './purchase-initial.page';

const routes: Routes = [
  {
    path: '',
    component: PurchaseInitialPage,
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SioLayoutModule,
    SioListModule,
    SioFormModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild({
      extend: true,
    }),
    ReactiveFormsModule,
  ],
  declarations: [PurchaseInitialPage, TransactionPairsModal],
})
export class PurchaseInitialPageModule {}
