import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { ResponsibilityAgreementModal } from './responsibility-agreement.modal';
import { SioListModule } from 'src/app/components/list-items/sio-list.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    SioListModule,
    TranslateModule.forChild({
      extend: true,
    }),
  ],
  declarations: [ResponsibilityAgreementModal],
  exports: [ResponsibilityAgreementModal],
  bootstrap: [ResponsibilityAgreementModal],
})
export class ResponsibilityAgreementModalModule {}
