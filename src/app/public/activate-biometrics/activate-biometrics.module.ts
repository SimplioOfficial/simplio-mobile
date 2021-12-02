import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
import { FingerprintAIO } from '@ionic-native/fingerprint-aio/ngx';

import { SioLayoutModule } from 'src/app/components/layout/sio-layout.module';
import { ActivateBiometricsPage } from './activate-biometrics.page';

const routes: Routes = [
  {
    path: '',
    component: ActivateBiometricsPage,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'enter',
      },
      {
        path: 'enter',
        loadChildren: () =>
          import('./enter-biometrics/enter-biometrics.module').then(
            m => m.EnterBiometricsPageModule,
          ),
      },
      {
        path: 'repeat',
        loadChildren: () =>
          import('./repeat-biometrics/repeat-biometrics.module').then(
            m => m.RepeatBiometricsPageModule,
          ),
      },
    ],
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SioLayoutModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild({
      extend: true,
    }),
  ],
  declarations: [ActivateBiometricsPage],
  providers: [FingerprintAIO],
})
export class ActivateBiometricsPageModule {}
