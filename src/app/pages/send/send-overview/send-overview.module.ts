import { NgModule } from '@angular/core';
// Modules
import { IonicModule } from '@ionic/angular';
import { SioSharedModule } from 'src/app/components/shared/sio-shared.module';
import { SioListModule } from 'src/app/components/list-items/sio-list.module';
import { SioLayoutModule } from 'src/app/components/layout/sio-layout.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// Router
import { Routes, RouterModule } from '@angular/router';
// Pages
import { SendOverviewPage } from './send-overview.page';

const routes: Routes = [
  {
    path: '',
    component: SendOverviewPage,
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SioSharedModule,
    SioListModule,
    SioLayoutModule,
    RouterModule.forChild(routes),
  ],
  declarations: [SendOverviewPage],
})
export class SendOverviewPageModule {}
