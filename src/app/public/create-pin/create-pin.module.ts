import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { SioLayoutModule } from 'src/app/components/layout/sio-layout.module';
import { CreatePinPage } from './create-pin.page';
import { TranslateModule } from '@ngx-translate/core';

const routes: Routes = [
  {
    path: '',
    component: CreatePinPage,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'intro',
      },
      {
        path: 'intro',
        loadChildren: () => import('./intro-pin/intro-pin.module').then(m => m.IntroPinPageModule),
      },
      {
        path: 'enter',
        loadChildren: () => import('./enter-pin/enter-pin.module').then(m => m.EnterPinPageModule),
      },
      {
        path: 'repeat',
        loadChildren: () =>
          import('./repeat-pin/repeat-pin.module').then(m => m.RepeatPinPageModule),
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
  declarations: [CreatePinPage],
})
export class CreatePinPageModule {}
