import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { StakePage } from './stake.page';
import { SioSharedModule } from 'src/app/components/shared/sio-shared.module';
import { SioListModule } from 'src/app/components/list-items/sio-list.module';
import { SioFormModule } from 'src/app/components/form/sio-form.module';
import { SioLayoutModule } from 'src/app/components/layout/sio-layout.module';
import { TransactionWalletsModalModule } from 'src/app/pages/modals/transaction-wallets-modal/transaction-wallets.module';
import { TransactionOptionsModal } from 'src/app/pages/modals/transaction-options-modal/transaction-options.modal';

const routes: Routes = [
  {
    path: '',
    component: StakePage,
  },
  {
    path: 'confirm',
    loadChildren: () =>
      import('./stake-confirm/stake-confirm.module').then(m => m.StakeConfirmPageModule),
  },
  {
    path: 'details',
    loadChildren: () =>
      import('./stake-details/stake-details.module').then(m => m.StakeDetailsPageModule),
    data: { tapbar: false },
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
  declarations: [StakePage, TransactionOptionsModal],
  bootstrap: [StakePage],
})
export class StakePageModule {}
