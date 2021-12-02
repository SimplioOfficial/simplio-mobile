import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { BackupSuccessPage } from './backup-success.page';
import { SioLayoutModule } from 'src/app/components/layout/sio-layout.module';
import { TranslateModule } from '@ngx-translate/core';

const routes: Routes = [
  {
    path: '',
    component: BackupSuccessPage,
    data: { tapbar: false },
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    SioLayoutModule,
    TranslateModule.forChild({
      extend: true,
    }),
  ],
  declarations: [BackupSuccessPage],
})
export class BackupSuccessPageModule {}
