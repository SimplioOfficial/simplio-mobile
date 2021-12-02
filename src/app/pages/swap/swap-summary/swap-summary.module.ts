import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Pages
import { SwapSummaryPage } from './swap-summary.page';

// Modules
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SioLayoutModule } from 'src/app/components/layout/sio-layout.module';
import { SioSharedModule } from 'src/app/components/shared/sio-shared.module';
import { SioListModule } from 'src/app/components/list-items/sio-list.module';

const routes: Routes = [
  {
    path: '',
    component: SwapSummaryPage,
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SioLayoutModule,
    SioSharedModule,
    SioListModule,
    RouterModule.forChild(routes),
  ],
  declarations: [SwapSummaryPage],
})
export class SwapSummaryPageModule {}
