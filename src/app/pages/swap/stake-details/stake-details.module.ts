import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SioSharedModule } from 'src/app/components/shared/sio-shared.module';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { StakeDetailsPage } from './stake-details.page';
import { SioListModule } from 'src/app/components/list-items/sio-list.module';
import { SioLayoutModule } from 'src/app/components/layout/sio-layout.module';
import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';
import { SioTapbarsModule } from 'src/app/components/tapbars/tapbars.module';
import { SioChartsModule } from 'src/app/components/charts/sio-charts.module';



const routes: Routes = [
  {
    path: '',
    component: StakeDetailsPage
  }
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
    SioTapbarsModule,
    SioChartsModule,
    NgxQRCodeModule
  ],
  declarations: [StakeDetailsPage]
})
export class StakeDetailsPageModule {}
