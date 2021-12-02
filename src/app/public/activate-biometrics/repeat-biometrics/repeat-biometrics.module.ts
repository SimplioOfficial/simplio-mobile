import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { SioLayoutModule } from 'src/app/components/layout/sio-layout.module';
import { RepeatBiometricsPage } from './repeat-biometrics.page';
import { TranslateModule } from '@ngx-translate/core';
import { SioIllustrationModule } from 'src/app/components/illustrations/sio-illustration.module';

const routes: Routes = [
  {
    path: '',
    component: RepeatBiometricsPage,
  },
];

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    SioIllustrationModule,
    SioLayoutModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild({
      extend: true,
    }),
  ],
  declarations: [RepeatBiometricsPage],
})
export class RepeatBiometricsPageModule {}
