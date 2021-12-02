import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { SioFormModule } from 'src/app/components/form/sio-form.module';
import { RegisterPasswordPage } from 'src/app/public/register/register-password/register-password.page';

const routes: Routes = [
  {
    path: '',
    component: RegisterPasswordPage,
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
  declarations: [RegisterPasswordPage],
})
export class RegisterPasswordPageModule {}
