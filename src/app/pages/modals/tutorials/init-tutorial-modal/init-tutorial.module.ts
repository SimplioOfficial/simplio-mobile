import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { SioLayoutModule } from 'src/app/components/layout/sio-layout.module';
import { InitTutorialModal } from './init-tutorial.modal';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    SioLayoutModule,
    TranslateModule.forChild({
      extend: true,
    }),
  ],
  declarations: [InitTutorialModal],
  exports: [InitTutorialModal],
  bootstrap: [InitTutorialModal],
})
export class InitTutorialModalModule {}
