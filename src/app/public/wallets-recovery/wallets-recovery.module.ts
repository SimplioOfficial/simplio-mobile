import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { SioLayoutModule } from 'src/app/components/layout/sio-layout.module';
import { WalletsRecoveryPage } from './wallets-recovery.page';

const routes: Routes = [
  {
    path: '',
    component: WalletsRecoveryPage,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'intro',
      },
      {
        path: 'intro',
        loadChildren: () =>
          import('./wallets-recovery-intro/wallets-recovery-intro.module').then(
            m => m.WalletsRecoveryIntroPageModule,
          ),
      },
      {
        path: 'enter',
        loadChildren: () =>
          import('./wallets-recovery-enter/wallets-recovery-enter.module').then(
            m => m.WalletsRecoveryEnterPageModule,
          ),
      },
    ],
  },
];

@NgModule({
  imports: [CommonModule, IonicModule, SioLayoutModule, RouterModule.forChild(routes)],
  declarations: [WalletsRecoveryPage],
})
export class WalletsRecoveryPageModule {}
