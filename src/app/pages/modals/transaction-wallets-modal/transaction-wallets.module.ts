import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { SioLayoutModule } from 'src/app/components/layout/sio-layout.module';
import { SioListModule } from 'src/app/components/list-items/sio-list.module';
import { TranslateModule } from '@ngx-translate/core';
import { TransactionWalletsModal } from './transaction-wallets.modal';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    SioLayoutModule,
    SioListModule,
    TranslateModule.forChild({
      extend: true,
    }),
  ],
  declarations: [TransactionWalletsModal],
  exports: [TransactionWalletsModal],
  bootstrap: [TransactionWalletsModal],
})
export class TransactionWalletsModalModule {}
