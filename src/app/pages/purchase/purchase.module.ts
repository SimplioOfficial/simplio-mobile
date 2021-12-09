import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { WalletsDataResolver } from '../../resolvers/wallets-data.resolver';
import { PurchasePage } from './purchase.page';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'initial',
    pathMatch: 'full',
  },
  {
    path: 'initial',
    resolve: {
      wallets: WalletsDataResolver,
    },
    loadChildren: () =>
      import('./purchase-initial/purchase-initial.module').then(m => m.PurchaseInitialPageModule),
    data: { tapbar: false },
  },
  {
    path: 'phone-number',
    loadChildren: () =>
      import('./phone-number/phone-number.module').then(m => m.PhoneNumberPageModule),
    data: { tapbar: false },
  },
  {
    path: 'phone-verify',
    loadChildren: () =>
      import('./phone-verify/phone-verify.module').then(m => m.PhoneVerifyModulePageModule),
    data: { tapbar: false },
  },
  {
    path: 'email-verify',
    loadChildren: () =>
      import('./email-verify/email-verify.module').then(m => m.EmailVerifyModulePageModule),
    data: { tapbar: false },
  },
  {
    path: 'gateway-iframe',
    loadChildren: () =>
      import('./gateway-iframe/gateway-iframe.module').then(m => m.GatewayIframeModulePageModule),
    data: { tapbar: false },
  },
  {
    path: 'final',
    loadChildren: () =>
      import('./purchase-final/purchase-final.module').then(m => m.PurchaseFinalPageModule),
    data: { tapbar: false },
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild({
      extend: true,
    }),
  ],
  declarations: [PurchasePage],
})
export class PurchasePageModule {}
