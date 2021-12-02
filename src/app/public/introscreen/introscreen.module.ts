import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

// Modules
import { IonicModule } from '@ionic/angular';
import { SioLayoutModule } from 'src/app/components/layout/sio-layout.module';
import { TranslateModule } from '@ngx-translate/core';
import { SioSharedModule } from '../../components/shared/sio-shared.module';

import { IntroscreenPage } from './introscreen.page';

const routes: Routes = [
  {
    path: '',
    component: IntroscreenPage,
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
    SioSharedModule,
  ],
  declarations: [IntroscreenPage],
})
export class IntroscreenPageModule {}
