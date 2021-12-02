import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { SioLayoutModule } from 'src/app/components/layout/sio-layout.module';
import { SioFormModule } from 'src/app/components/form/sio-form.module';
import { TranslateModule } from '@ngx-translate/core';
import { ChangePasswordPage } from 'src/app/pages/user/settings/change-pass/change-pass.page';

const routes: Routes = [
  {
    path: '',
    component: ChangePasswordPage,
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SioLayoutModule,
    SioFormModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild({
      extend: true,
    }),
  ],
  declarations: [ChangePasswordPage],
})
export class ChangePasswordPageModule {}
