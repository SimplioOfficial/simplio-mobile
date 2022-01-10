import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { SioRegularTransactionItemComponent } from 'src/app/components/list-items/sio-regular-transaction-item/sio-regular-transaction-item.component';
import { SioTokenTransactionItemComponent } from 'src/app/components/list-items/sio-token-transaction-item/sio-token-transaction-item.component';
import { SioSharedModule } from 'src/app/components/shared/sio-shared.module';

@NgModule({
  imports: [CommonModule, IonicModule, SioSharedModule],
  declarations: [SioRegularTransactionItemComponent, SioTokenTransactionItemComponent],
  exports: [SioRegularTransactionItemComponent, SioTokenTransactionItemComponent],
})
export class SioListModule {}
