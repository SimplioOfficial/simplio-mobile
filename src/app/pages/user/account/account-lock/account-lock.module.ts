import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { SioFormModule } from '../../../../components/form/sio-form.module';
import { SioIllustrationModule } from '../../../../components/illustrations/sio-illustration.module';
import { SioLayoutModule } from '../../../../components/layout/sio-layout.module';
import { SioSharedModule } from '../../../../components/shared/sio-shared.module';
import { AccountLockPage } from './account-lock.page';

const routes: Routes = [
  {
    path: '',
    component: AccountLockPage,
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
    SioFormModule,
    SioIllustrationModule,
    SioSharedModule,
    TranslateModule.forChild({
      extend: true,
    }),
  ],
  declarations: [AccountLockPage],
})
export class AccountLockPageModule {}
