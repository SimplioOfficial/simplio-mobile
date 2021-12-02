import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { NameCustomTokenPage } from './name-custom-token.page';
import { SioSharedModule } from 'src/app/components/shared/sio-shared.module';
import { SioListModule } from 'src/app/components/list-items/sio-list.module';
import { SioLayoutModule } from 'src/app/components/layout/sio-layout.module';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { AddCoinOptionsModalModule } from 'src/app/pages/modals/add-coin-options-modal/add-coin-options.module';

const routes: Routes = [
  {
    path: '',
    component: NameCustomTokenPage,
  },
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IonicModule,
    SioSharedModule,
    SioListModule,
    SioLayoutModule,
    RouterModule.forChild(routes),
    AddCoinOptionsModalModule,
  ],
  providers: [BarcodeScanner],
  declarations: [NameCustomTokenPage],
})
export class NameCustomTokenPageModule {}
