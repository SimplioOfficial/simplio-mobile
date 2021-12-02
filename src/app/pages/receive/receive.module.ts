import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReceivePage } from './receive.page';
import { SioListModule } from 'src/app/components/list-items/sio-list.module';
import { SioSharedModule } from 'src/app/components/shared/sio-shared.module';
import { SioLayoutModule } from 'src/app/components/layout/sio-layout.module';
import { IonicModule } from '@ionic/angular';
import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';
import { TransactionWalletsModalModule } from '../modals/transaction-wallets-modal/transaction-wallets.module';

const routes: Routes = [
  {
    path: '',
    component: ReceivePage,
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    NgxQRCodeModule,
    SioSharedModule,
    SioListModule,
    SioLayoutModule,
    TransactionWalletsModalModule,
  ],
  declarations: [ReceivePage],
})
export class ReceivePageModule {}
