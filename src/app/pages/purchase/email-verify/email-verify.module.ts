import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { SioFormModule } from '../../../components/form/sio-form.module';
import { SioLayoutModule } from '../../../components/layout/sio-layout.module';
import { EmailVerifyPage } from './email-verify.page';
import { TranslateModule } from '@ngx-translate/core';

const routes: Routes = [
  {
    path: '',
    component: EmailVerifyPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild({
      extend: true
    }),
    SioFormModule,
    SioLayoutModule
  ],
  declarations: [EmailVerifyPage]
})
export class EmailVerifyModulePageModule {}
