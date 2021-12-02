import { SioSharedModule } from 'src/app/components/shared/sio-shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { OverviewTransactionsPage } from './overview-transactions.page';
import { SioListModule } from 'src/app/components/list-items/sio-list.module';
import { SioLayoutModule } from 'src/app/components/layout/sio-layout.module';
import { ChartModule } from 'src/app/components/sio-chart/sio-chart.module';
import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';
import { TransactionsDataResolver } from 'src/app/resolvers/transactions-data.resolver';

const routes: Routes = [
  {
    path: '',
    component: OverviewTransactionsPage,
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
  declarations: [OverviewTransactionsPage],
})
export class OverviewTransactionsPageModule {}
