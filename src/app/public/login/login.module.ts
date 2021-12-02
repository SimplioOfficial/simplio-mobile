import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { SioFormModule } from 'src/app/components/form/sio-form.module';
import { SioLayoutModule } from 'src/app/components/layout/sio-layout.module';
import { SioSharedModule } from 'src/app/components/shared/sio-shared.module';
import { LoginPage } from './login.page';
import { FingerprintAIO } from '@ionic-native/fingerprint-aio/ngx';

const routes: Routes = [
  {
    path: '',
    component: LoginPage,
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SioLayoutModule,
    SioSharedModule,
    SioFormModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild({
      extend: true,
    }),
  ],
  declarations: [LoginPage],
  providers: [FingerprintAIO],
})
export class LoginPageModule {}
