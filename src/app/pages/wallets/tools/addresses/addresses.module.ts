import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { AddressesPage } from './addresses.page';
import { SioLayoutModule } from 'src/app/components/layout/sio-layout.module';
import { SioSharedModule } from 'src/app/components/shared/sio-shared.module';

const routes: Routes = [
  {
    path: '',
    component: AddressesPage,
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SioLayoutModule,
    SioSharedModule,
    RouterModule.forChild(routes),
  ],
  declarations: [AddressesPage],
})
export class AddressesPageModule {}
