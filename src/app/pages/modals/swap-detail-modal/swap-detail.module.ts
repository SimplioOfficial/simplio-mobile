import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { SioLayoutModule } from 'src/app/components/layout/sio-layout.module';
import { SioListModule } from 'src/app/components/list-items/sio-list.module';
import { TranslateModule } from '@ngx-translate/core';
import { SwapDetailModal } from './swap-detail.modal';
import { FormsModule } from '@angular/forms';
import { SioSharedModule } from 'src/app/components/shared/sio-shared.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    SioLayoutModule,
    SioListModule,
    SioSharedModule,
    TranslateModule.forChild({
      extend: true,
    }),
  ],
  declarations: [SwapDetailModal],
  exports: [SwapDetailModal],
  bootstrap: [SwapDetailModal],
})
export class SwapDetailModalModule {}
