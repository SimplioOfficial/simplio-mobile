import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

// Modules
import { IonicModule } from '@ionic/angular';
import { SioLayoutModule } from 'src/app/components/layout/sio-layout.module';
import { SioSharedModule } from 'src/app/components/shared/sio-shared.module';
import { SioFormModule } from 'src/app/components/form/sio-form.module';
import { SioListModule } from 'src/app/components/list-items/sio-list.module';

import { ExchangePage } from './exchange.page';
import { SwapWalletModal } from '../../modals/swap-wallet-modal/swap-wallet.modal';
import { SwapListModal } from '../../modals/swap-list-modal/swap-list.modal';

const routes: Routes = [
  {
    path: '',
    component: ExchangePage,
  },
  {
    path: 'summary',
    loadChildren: () =>
      import('../swap-summary/swap-summary.module').then(m => m.SwapSummaryPageModule),
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SioLayoutModule,
    SioSharedModule,
    SioFormModule,
    SioListModule,
    RouterModule.forChild(routes),
  ],
  declarations: [SwapListModal, SwapWalletModal, ExchangePage],
  bootstrap: [ExchangePage],
})
export class ExchangePageModule {}
