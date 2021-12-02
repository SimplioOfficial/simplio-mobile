import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { SioLayoutModule } from 'src/app/components/layout/sio-layout.module';
import { SioListModule } from 'src/app/components/list-items/sio-list.module';
import { ActiveWalletsPage } from './active-wallets.page';

const routes: Routes = [
  {
    path: '',
    component: ActiveWalletsPage,
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SioLayoutModule,
    SioListModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild({
      extend: true,
    }),
  ],
  declarations: [ActiveWalletsPage],
})
export class ActiveWalletsPageModule {}
