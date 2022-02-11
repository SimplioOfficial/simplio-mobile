import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { SwapDetailModalModule } from 'src/app/pages/modals/swap-detail-modal/swap-detail.module';
import { SioLayoutModule } from '../../../components/layout/sio-layout.module';
import { SioListModule } from '../../../components/list-items/sio-list.module';
import { SioSharedModule } from '../../../components/shared/sio-shared.module';
import { PurchaseFinalPage } from './purchase-final.page';

const routes: Routes = [
  {
    path: '',
    component: PurchaseFinalPage,
    data: { tapbar: false },
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SioLayoutModule,
    SioListModule,
    SioSharedModule,
    SwapDetailModalModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild({
      extend: true,
    }),
    SioLayoutModule,
  ],
  declarations: [PurchaseFinalPage],
  bootstrap: [PurchaseFinalPage],
})
export class PurchaseFinalPageModule {}
