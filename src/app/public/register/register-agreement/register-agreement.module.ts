import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { SioFormModule } from 'src/app/components/form/sio-form.module';
import { RegisterAgreementPage } from 'src/app/public/register/register-agreement/register-agreement.page';
import { SioLayoutModule } from '../../../components/layout/sio-layout.module';

const routes: Routes = [
  {
    path: '',
    component: RegisterAgreementPage,
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SioFormModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild({
      extend: true,
    }),
    SioLayoutModule,
  ],
  declarations: [RegisterAgreementPage],
})
export class RegisterAgreementPageModule {}
