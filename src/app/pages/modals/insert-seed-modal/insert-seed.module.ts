import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { SioLayoutModule } from 'src/app/components/layout/sio-layout.module';
import { SioListModule } from 'src/app/components/list-items/sio-list.module';
import { TranslateModule } from '@ngx-translate/core';
import { InsertSeedModal } from './insert-seed.modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    SioLayoutModule,
    SioListModule,
    TranslateModule.forChild({
      extend: true,
    }),
    ReactiveFormsModule,
  ],
  declarations: [InsertSeedModal],
  exports: [InsertSeedModal],
  bootstrap: [InsertSeedModal],
})
export class InsertSeedModalModule {}
