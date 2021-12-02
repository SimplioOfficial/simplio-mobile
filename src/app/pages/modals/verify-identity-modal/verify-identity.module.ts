import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TranslateModule } from '@ngx-translate/core';
import { FingerprintAIO } from '@ionic-native/fingerprint-aio/ngx';

import { SioLayoutModule } from 'src/app/components/layout/sio-layout.module';
import { SioListModule } from 'src/app/components/list-items/sio-list.module';
import { VerifyIdentityModal } from './verify-identity.modal';
import { SioFormModule } from 'src/app/components/form/sio-form.module';
import { SioIllustrationModule } from 'src/app/components/illustrations/sio-illustration.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    SioLayoutModule,
    SioListModule,
    SioFormModule,
    SioIllustrationModule,
    TranslateModule.forChild({
      extend: true,
    }),
  ],
  declarations: [VerifyIdentityModal],
  exports: [VerifyIdentityModal],
  bootstrap: [VerifyIdentityModal],
  providers: [FingerprintAIO],
})
export class VerifyIdentityModalModule {}
