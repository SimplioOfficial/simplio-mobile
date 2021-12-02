import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { SioLayoutModule } from 'src/app/components/layout/sio-layout.module';
import { SioListModule } from 'src/app/components/list-items/sio-list.module';
import { TranslateModule } from '@ngx-translate/core';
import { VerifySmsModal } from './verify-sms.modal';
import { SioFormModule } from 'src/app/components/form/sio-form.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    SioLayoutModule,
    SioListModule,
    SioFormModule,
    TranslateModule.forChild({
      extend: true,
    }),
  ],
  declarations: [VerifySmsModal],
  exports: [VerifySmsModal],
  bootstrap: [VerifySmsModal],
})
export class VerifySmsModalModule {}
