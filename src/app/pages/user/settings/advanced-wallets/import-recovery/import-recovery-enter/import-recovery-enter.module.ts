import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { SioLayoutModule } from 'src/app/components/layout/sio-layout.module';
import { ImportRecoveryEnterPage } from './import-recovery-enter.page';

const routes: Routes = [
  {
    path: '',
    component: ImportRecoveryEnterPage,
  },
];

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    SioLayoutModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild({
      extend: true,
    }),
  ],
  declarations: [ImportRecoveryEnterPage],
})
export class ImportRecoveryEnterPageModule {}
