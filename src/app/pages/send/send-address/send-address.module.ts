import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

// Modules
import { IonicModule } from '@ionic/angular';
import { SioSharedModule } from 'src/app/components/shared/sio-shared.module';
import { SioListModule } from 'src/app/components/list-items/sio-list.module';
import { SioLayoutModule } from 'src/app/components/layout/sio-layout.module';

import { SendAddressPage } from './send-address.page';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';

const routes: Routes = [
  {
    path: '',
    component: SendAddressPage,
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SioSharedModule,
    SioListModule,
    SioLayoutModule,
    RouterModule.forChild(routes),
  ],
  providers: [BarcodeScanner],
  declarations: [SendAddressPage],
})
export class SendAddressPageModule {}
