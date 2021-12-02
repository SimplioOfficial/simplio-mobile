import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { SioLayoutModule } from 'src/app/components/layout/sio-layout.module';
import { SioSharedModule } from 'src/app/components/shared/sio-shared.module';
import { SioListModule } from 'src/app/components/list-items/sio-list.module';
import { getSwapDataResolverOf } from 'src/app/resolvers/swap-data.resolver';
import { WalletsDataResolver } from 'src/app/resolvers/wallets-data.resolver';
import { SwapType } from 'src/app/interface/swap';
import { SwapDetailModalModule } from 'src/app/pages/modals/swap-detail-modal/swap-detail.module';
import { ResponsibilityAgreementGuard } from 'src/app/guards/responsibility-agreement.guard';
import { SwapPage } from './swap.page';
import { SioChartsModule } from 'src/app/components/charts/sio-charts.module';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'overview',
    pathMatch: 'full'
  },
  {
    path: 'overview',
    component: SwapPage,
    data: { tapbar: true }
  },
  {
    path: 'exchange',
    canActivate: [ResponsibilityAgreementGuard],
    resolve: {
      wallets: WalletsDataResolver,
      pairs: getSwapDataResolverOf(SwapType.Single)
    },
    loadChildren: () => import('./exchange/exchange.module').then(m => m.ExchangePageModule),
    data: { tapbar: false }
  },
  {
    path: 'confirm',
    loadChildren: () => import('./swap-confirm/swap-confirm.module').then(m => m.SwapConfirmPageModule),
    data: { tapbar: false }
  },
  {
    path: 'update',
    resolve: {
      pairs: getSwapDataResolverOf(SwapType.Single)
    },
    loadChildren: () => import('./swap-update/swap-update.module').then(m => m.SwapUpdatePageModule),
    data: { tapbar: false }
  },
  {
    path: 'stake-details',
    loadChildren: () => import('./stake-details/stake-details.module').then( m => m.StakeDetailsPageModule),
    data: { tapbar: false }
  },
  {
  path: 'stake',
    loadChildren: () => import('../stake/stake.module').then( m => m.StakePageModule),
    data: { tapbar: false }
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SioLayoutModule,
    SioListModule,
    SioChartsModule,
    SioSharedModule,
    SwapDetailModalModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild({
      extend: true
    })
  ],
  entryComponents: [SwapPage],
  declarations: [SwapPage],
  bootstrap: [SwapPage]
})
export class SwapPageModule {}
