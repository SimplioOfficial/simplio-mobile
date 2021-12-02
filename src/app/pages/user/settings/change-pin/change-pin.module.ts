import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { SioLayoutModule } from 'src/app/components/layout/sio-layout.module';
import { ChangePinPage } from './change-pin.page';
import { TranslateModule } from '@ngx-translate/core';

const routes: Routes = [
  {
    path: '',
    component: ChangePinPage,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'verify',
      },
      {
        path: 'verify',
        loadChildren: () =>
          import('./verify-change-pin/verify-pin.module').then(m => m.VerifyChangePinPageModule),
        data: { tapbar: false },
      },
      {
        path: 'enter',
        loadChildren: () =>
          import('./enter-change-pin/enter-pin.module').then(m => m.EnterChangePinPageModule),
        data: { tapbar: false },
      },
      {
        path: 'repeat',
        loadChildren: () =>
          import('./repeat-change-pin/repeat-pin.module').then(m => m.RepeatChangePinPageModule),
        data: { tapbar: false },
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
  declarations: [ChangePinPage],
})
export class ChangePinPageModule {}
