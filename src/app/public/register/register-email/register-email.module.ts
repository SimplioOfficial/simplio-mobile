import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { SioFormModule } from 'src/app/components/form/sio-form.module';
import { RegisterEmailPage } from 'src/app/public/register/register-email/register-email.page';

const routes: Routes = [
  {
    path: '',
    component: RegisterEmailPage,
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
  ],
  declarations: [RegisterEmailPage],
})
export class RegisterEmailPageModule {}
