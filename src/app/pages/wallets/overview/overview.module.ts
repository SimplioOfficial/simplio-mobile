import { SioSharedModule } from 'src/app/components/shared/sio-shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { OverviewPage } from './overview.page';
import { SioListModule } from 'src/app/components/list-items/sio-list.module';
import { SioLayoutModule } from 'src/app/components/layout/sio-layout.module';
import { ChartModule } from 'src/app/components/sio-chart/sio-chart.module';
import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';
import { TransactionsDataResolver } from 'src/app/resolvers/transactions-data.resolver';

const routes: Routes = [
  {
    path: '',
    resolve: {
      transactions: TransactionsDataResolver,
    },
    component: OverviewPage,
    data: { tapbar: true },
  },
  {
    path: 'tools',
    loadChildren: () => import('../tools/tools.module').then(m => m.ToolsPageModule),
    data: { tapbar: false },
  },
  {
    path: 'transactions',
    loadChildren: () =>
      import('./overview-transactions/overview-transactions.module').then(
        m => m.OverviewTransactionsPageModule,
      ),
    data: { tapbar: false },
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    SioListModule,
    SioSharedModule,
    SioLayoutModule,
    ChartModule,
    NgxQRCodeModule,
  ],
  declarations: [OverviewPage],
})
export class OverviewPageModule {}
