import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { BackupPage } from './backup.page';
import { SioLayoutModule } from 'src/app/components/layout/sio-layout.module';
import { TranslateModule } from '@ngx-translate/core';

const routes: Routes = [
  {
    path: '',
    component: BackupPage,
    data: { tapbar: false },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'entry',
      },
      {
        path: 'entry',
        loadChildren: () =>
          import('./backup-entry/backup-entry.module').then(m => m.BackupEntryPageModule),
      },
      {
        path: 'intro',
        loadChildren: () =>
          import('./backup-intro/backup-intro.module').then(m => m.BackupIntroPageModule),
      },
      {
        path: 'repeat',
        loadChildren: () =>
          import('./backup-repeat/backup-repeat.module').then(m => m.BackupRepeatPageModule),
      },
    ],
  },
  {
    path: 'success',
    loadChildren: () =>
      import('./backup-success/backup-success.module').then(m => m.BackupSuccessPageModule),
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
  declarations: [BackupPage],
})
export class BackupPageModule {}
