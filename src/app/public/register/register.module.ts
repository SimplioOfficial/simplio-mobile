import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { SioLayoutModule } from 'src/app/components/layout/sio-layout.module';
import { RegisterPage } from 'src/app/public/register/register.page';

const routes: Routes = [
  {
    path: '',
    component: RegisterPage,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'email',
      },
      {
        path: 'email',
        loadChildren: () =>
          import('./register-email/register-email.module').then(m => m.RegisterEmailPageModule),
      },
      {
        path: 'password',
        loadChildren: () =>
          import('./register-password/register-password.module').then(
            m => m.RegisterPasswordPageModule,
          ),
      },
      {
        path: 'agreement',
        loadChildren: () =>
          import('./register-agreement/register-agreement.module').then(
            m => m.RegisterAgreementPageModule,
          ),
      },
      {
        path: 'verify',
        loadChildren: () =>
          import('./register-verify/register-verify.module').then(m => m.RegisterVerifyPageModule),
      },
    ],
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
  ],
  declarations: [RegisterPage],
})
export class RegisterPageModule {}
