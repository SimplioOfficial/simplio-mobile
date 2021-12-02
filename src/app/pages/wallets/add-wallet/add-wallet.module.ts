import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SioSharedModule } from 'src/app/components/shared/sio-shared.module';
import { SioListModule } from 'src/app/components/list-items/sio-list.module';
import { SioLayoutModule } from 'src/app/components/layout/sio-layout.module';
import { AddWalletPage } from './add-wallet.page';
import { AddTokenResolver } from 'src/app/resolvers/add-token.resolver';

const routes: Routes = [
  {
    path: '',
    component: AddWalletPage,
    data: { tapbar: false },
  },
  {
    path: ':ticker',
    loadChildren: () =>
      import('../name-wallet/name-wallet.module').then(m => m.NameWalletPageModule),
  },
  {
    path: 'custom/:ticker',
    loadChildren: () =>
      import('../name-custom-token/name-custom-token.module').then(
        m => m.NameCustomTokenPageModule,
      ),
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
  providers: [AddTokenResolver],
  declarations: [AddWalletPage],
})
export class AddWalletPageModule {}
