import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { SendPage } from './send.page';
import { SioSharedModule } from 'src/app/components/shared/sio-shared.module';
import { SioListModule } from 'src/app/components/list-items/sio-list.module';
import { SioFormModule } from 'src/app/components/form/sio-form.module';
import { SioLayoutModule } from 'src/app/components/layout/sio-layout.module';
import { TransactionWalletsModalModule } from 'src/app/pages/modals/transaction-wallets-modal/transaction-wallets.module';
import { TransactionOptionsModal } from 'src/app/pages/modals/transaction-options-modal/transaction-options.modal';

const routes: Routes = [
  {
    path: '',
    component: SendPage,
  },
  {
    path: 'sendaddress',
    loadChildren: () =>
      import('./send-address/send-address.module').then(m => m.SendAddressPageModule),
  },
  {
    path: 'sendconfirm',
    loadChildren: () =>
      import('./send-confirm/send-confirm.module').then(m => m.SendConfirmPageModule),
  },
  {
    path: 'sendoverview',
    loadChildren: () =>
      import('./send-overview/send-overview.module').then(m => m.SendOverviewPageModule),
  },
  {
    path: 'send-wallets',
    loadChildren: () =>
      import('./send-wallets/send-wallets.module').then(m => m.SendWalletsPageModule),
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    SioSharedModule,
    SioListModule,
    SioFormModule,
    SioLayoutModule,
    TransactionWalletsModalModule,
  ],
  declarations: [SendPage, TransactionOptionsModal],
  bootstrap: [SendPage],
})
export class SendPageModule {}
