import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ChartModule } from 'src/app/components/sio-chart/sio-chart.module';
import { SioSharedModule } from 'src/app/components/shared/sio-shared.module';
import { SioListModule } from 'src/app/components/list-items/sio-list.module';
import { SioLayoutModule } from 'src/app/components/layout/sio-layout.module';
import { LongPressDirective } from 'src/app/directives/long-press.directive';
import { WalletsOverviewPage } from './wallets-overview.page';
import { InitTutorialService } from 'src/app/services/tutorials/presenters/init-tutorial.service';

const routes: Routes = [
  {
    path: '',
    component: WalletsOverviewPage,
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
  ],
  providers: [InitTutorialService],
  declarations: [WalletsOverviewPage, LongPressDirective],
  bootstrap: [WalletsOverviewPage],
})
export class WalletsOverviewPageModule {}
