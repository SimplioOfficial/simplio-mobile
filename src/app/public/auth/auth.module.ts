import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { SioFormModule } from 'src/app/components/form/sio-form.module';
import { SioIllustrationModule } from 'src/app/components/illustrations/sio-illustration.module';
import { SioLayoutModule } from 'src/app/components/layout/sio-layout.module';
import { AuthPage } from './auth.page';

const routes: Routes = [
  {
    path: '',
    component: AuthPage,
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SioLayoutModule,
    SioIllustrationModule,
    SioFormModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild({
      extend: true,
    }),
  ],
  declarations: [AuthPage],
})
export class AuthPageModule {}
