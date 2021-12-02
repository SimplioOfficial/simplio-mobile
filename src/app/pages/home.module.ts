import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { HomePage } from './home.page';
import { ChartModule } from 'src/app/components/sio-chart/sio-chart.module';
import { HttpClientModule } from '@angular/common/http';
import { SioTapbarModule } from 'src/app/components/sio-tapbar/sio-tapbar.module';
import { SioSharedModule } from 'src/app/components/shared/sio-shared.module';
import { AccountWalletsResolver } from '../resolvers/account-wallets.resolver';
import { AccountSettingsResolver } from '../resolvers/account-settings.resolver';
import { AccountMasterSeedResolver } from '../resolvers/account-master-seed.resolver';
import { AccountTutorialsResolver } from 'src/app/resolvers/account-tutorials.resolver';
import { ResponsibilityAgreementModalModule } from 'src/app/pages/modals/responsibility-agreement-modal/responsibility-agreement.module';
import { ActionsModalModule } from 'src/app/pages/modals/actions-modal/actions.module';
import { IsUserTrustworthyGuard } from '../guards/is-user-trustworthy-guard';

const routes: Routes = [
  {
    path: '',
    component: HomePage,
    resolve: {
      msed: AccountMasterSeedResolver,
      settings: AccountSettingsResolver,
      wallets: AccountWalletsResolver,
      tutorials: AccountTutorialsResolver,
    },
    children: [
      {
        path: '',
        redirectTo: 'wallets',
        pathMatch: 'full',
      },
      {
        path: 'wallets',
        loadChildren: () => import('./wallets/wallets.module').then(m => m.WalletsPageModule),
        data: { tapbar: true },
      },
      {
        path: 'user',
        loadChildren: () => import('./user/user.module').then(m => m.UserPageModule),
        data: { tapbar: false },
      },
      {
        path: 'swap',
        loadChildren: () => import('./swap/swap.module').then(m => m.SwapPageModule),
        data: { tapbar: true },
      },
      {
        path: 'purchase',
        canActivate: [IsUserTrustworthyGuard],
        runGuardsAndResolvers: 'always',
        loadChildren: () => import('./purchase/purchase.module').then(m => m.PurchasePageModule),
        data: { tapbar: true },
      },
    ],
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    HttpClientModule,
    ChartModule,
    SioSharedModule,
    SioTapbarModule,
    ResponsibilityAgreementModalModule,
    ActionsModalModule,
  ],
  providers: [
    AccountMasterSeedResolver,
    AccountSettingsResolver,
    AccountWalletsResolver,
    AccountTutorialsResolver,
  ],
  declarations: [HomePage],
})
export class HomePageModule {}
