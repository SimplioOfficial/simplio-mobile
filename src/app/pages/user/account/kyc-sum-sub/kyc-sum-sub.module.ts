import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { SioFormModule } from '../../../../components/form/sio-form.module';
import { SioSharedModule } from '../../../../components/shared/sio-shared.module';

import { KycSumSubPage } from './kyc-sum-sub.page';

const routes: Routes = [
  {
    path: '',
    component: KycSumSubPage,
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
    SioFormModule,
    SioSharedModule,
    TranslateModule.forChild({
      extend: true,
    }),
  ],
  declarations: [KycSumSubPage],
})
export class KycSumSubPageModule {}
