import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

// Modules
import { SioSharedModule } from 'src/app/components/shared/sio-shared.module';
import { SioLayoutModule } from 'src/app/components/layout/sio-layout.module';
import { IonicModule } from '@ionic/angular';

import { SendConfirmPage } from './send-confirm.page';
import { SioFormModule } from 'src/app/components/form/sio-form.module';

const routes: Routes = [
  {
    path: '',
    component: SendConfirmPage,
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SioSharedModule,
    SioLayoutModule,
    SioFormModule,
    RouterModule.forChild(routes),
  ],
  declarations: [SendConfirmPage],
})
export class SendConfirmPageModule {}
