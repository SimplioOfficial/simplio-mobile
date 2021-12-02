import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

// Modules
import { SioLayoutModule } from 'src/app/components/layout/sio-layout.module';
import { IonicModule } from '@ionic/angular';

import { AboutPage } from './about.page';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { AboutTranslateLoader } from 'src/app/providers/translate';

const routes: Routes = [
  {
    path: '',
    component: AboutPage,
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
      loader: { provide: TranslateLoader, useClass: AboutTranslateLoader },
    }),
  ],
  declarations: [AboutPage],
})
export class AboutPageModule {}
