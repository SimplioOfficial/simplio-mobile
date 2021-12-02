import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { BackupRepeatPage } from './backup-repeat.page';
import { SioLayoutModule } from 'src/app/components/layout/sio-layout.module';
import { TranslateModule } from '@ngx-translate/core';

const routes: Routes = [
  {
    path: '',
    component: BackupRepeatPage,
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    SioLayoutModule,
    NgxQRCodeModule,
    TranslateModule.forChild({
      extend: true,
    }),
  ],
  declarations: [BackupRepeatPage],
})
export class BackupRepeatPageModule {}
