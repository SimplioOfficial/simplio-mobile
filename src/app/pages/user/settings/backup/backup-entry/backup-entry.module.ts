import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { BackupEntryPage } from './backup-entry.page';
import { SioLayoutModule } from 'src/app/components/layout/sio-layout.module';
import { TranslateModule } from '@ngx-translate/core';

const routes: Routes = [
  {
    path: '',
    component: BackupEntryPage,
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
    NgxQRCodeModule,
    TranslateModule.forChild({
      extend: true,
    }),
  ],
  declarations: [BackupEntryPage],
})
export class BackupEntryPageModule {}
