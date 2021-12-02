import { SioSharedModule } from 'src/app/components/shared/sio-shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { SendWalletsPage } from './send-wallets.page';
// Modules
import { SioListModule } from 'src/app/components/list-items/sio-list.module';

const routes: Routes = [
  {
    path: '',
    component: SendWalletsPage,
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    SioListModule,
    SioSharedModule,
  ],
  declarations: [SendWalletsPage],
})
export class SendWalletsPageModule {}
