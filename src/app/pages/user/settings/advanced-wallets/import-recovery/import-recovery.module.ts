import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { SioLayoutModule } from 'src/app/components/layout/sio-layout.module';
import { ImportRecoveryPage } from './import-recovery.page';

const routes: Routes = [
  {
    path: '',
    component: ImportRecoveryPage,
    children: [
      {
        path: '',
        redirectTo: 'intro',
        pathMatch: 'full',
      },
      {
        path: 'intro',
        loadChildren: () =>
          import('./import-recovery-intro/import-recovery-intro.module').then(
            m => m.ImportRecoveryIntroPageModule,
          ),
      },
      {
        path: 'enter',
        loadChildren: () =>
          import('./import-recovery-enter/import-recovery-enter.module').then(
            m => m.ImportRecoveryEnterPageModule,
          ),
      },
    ],
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
  declarations: [ImportRecoveryPage],
})
export class ImportRecoveryPageModule {}
