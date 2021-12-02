import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { SioLayoutModule } from 'src/app/components/layout/sio-layout.module';
import { SioListModule } from 'src/app/components/list-items/sio-list.module';
import { TranslateModule } from '@ngx-translate/core';
import { AddCoinOptionsModal } from './add-coin-options.modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SioLayoutModule,
    SioListModule,
    TranslateModule.forChild({
      extend: true,
    }),
  ],
  declarations: [AddCoinOptionsModal],
  exports: [AddCoinOptionsModal],
  bootstrap: [AddCoinOptionsModal],
})
export class AddCoinOptionsModalModule {}
