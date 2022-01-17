import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { PurchaseSummaryPage } from './purchase-summary.page';
import { SioLayoutModule } from 'src/app/components/layout/sio-layout.module';
import { SioListModule } from 'src/app/components/list-items/sio-list.module';
import { SioSharedModule } from 'src/app/components/shared/sio-shared.module';

const routes: Routes = [
  {
    path: '',
    component: PurchaseSummaryPage,
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild({ extend: true }),
    SioLayoutModule,
    SioListModule,
    SioSharedModule,
  ],
  declarations: [PurchaseSummaryPage],
})
export class PurchaseSummaryPageModule {}
