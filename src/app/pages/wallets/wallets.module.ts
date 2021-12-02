import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ChartModule } from 'src/app/components/sio-chart/sio-chart.module';
import { SioSharedModule } from 'src/app/components/shared/sio-shared.module';
import { SioListModule } from 'src/app/components/list-items/sio-list.module';
import { SioLayoutModule } from 'src/app/components/layout/sio-layout.module';
import { ResponsibilityAgreementGuard } from 'src/app/guards/responsibility-agreement.guard';
import { InitTutorialModalModule } from 'src/app/pages/modals/tutorials/init-tutorial-modal/init-tutorial.module';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'overview',
    pathMatch: 'full',
  },
  {
    path: 'overview',
    loadChildren: () =>
      import('./wallets-overview/wallets-overview.module').then(m => m.WalletsOverviewPageModule),
    data: { tapbar: true },
  },
  {
    path: ':name/overview',
    loadChildren: () => import('./overview/overview.module').then(m => m.OverviewPageModule),
    data: { tapbar: true },
  },
  {
    path: 'add',
    loadChildren: () => import('./add-wallet/add-wallet.module').then(m => m.AddWalletPageModule),
    data: { tapbar: false },
  },
  {
    path: 'send',
    loadChildren: () => import('../send/send.module').then(m => m.SendPageModule),
    canActivate: [ResponsibilityAgreementGuard],
    data: { tapbar: false },
  },
  {
    path: 'receive',
    canActivate: [ResponsibilityAgreementGuard],
    loadChildren: () => import('../receive/receive.module').then(m => m.ReceivePageModule),
    data: { tapbar: false },
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    ChartModule,
    SioSharedModule,
    SioListModule,
    SioLayoutModule,
    InitTutorialModalModule,
  ],
})
export class WalletsPageModule {}
