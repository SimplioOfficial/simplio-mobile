import { TranslateModule } from '@ngx-translate/core';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { SwapConfirmPage } from './swap-confirm.page';
import { SioLayoutModule } from 'src/app/components/layout/sio-layout.module';
import { SioFormModule } from 'src/app/components/form/sio-form.module';

const routes: Routes = [
  {
    path: '',
    component: SwapConfirmPage,
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
  declarations: [SwapConfirmPage],
})
export class SwapConfirmPageModule {}
