import { TranslateModule } from '@ngx-translate/core';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { StakeConfirmPage } from './stake-confirm.page';
import { SioLayoutModule } from 'src/app/components/layout/sio-layout.module';
import { SioFormModule } from 'src/app/components/form/sio-form.module';

const routes: Routes = [
  {
    path: '',
    component: StakeConfirmPage,
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SioLayoutModule,
    SioFormModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild({
      extend: true,
    }),
  ],
  declarations: [StakeConfirmPage],
})
export class StakeConfirmPageModule {}
