import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

// Modules
import { IonicModule } from '@ionic/angular';
import { SioLayoutModule } from 'src/app/components/layout/sio-layout.module';
import { SioListModule } from 'src/app/components/list-items/sio-list.module';

import { ToolsPage } from './tools.page';
import { TranslateModule } from '@ngx-translate/core';

const routes: Routes = [
  {
    path: '',
    component: ToolsPage,
  },
  {
    path: 'rename',
    loadChildren: () => import('./rename/rename.module').then(m => m.RenamePageModule),
  },
  {
    path: 'decimals',
    loadChildren: () => import('./decimals/decimals.module').then(m => m.DecimalsPageModule),
  },
  {
    path: 'addresses',
    loadChildren: () => import('./addresses/addresses.module').then(m => m.AddressesPageModule),
  },
  {
    path: 'apiurl',
    loadChildren: () => import('./apiurl/apiurl.module').then(m => m.ApiurlPageModule),
  },
  {
    path: 'walletinfo',
    loadChildren: () => import('./wallet-info/walletinfo.module').then(m => m.WalletinfoPageModule),
  },
  {
    path: 'linked',
    loadChildren: () => import('./linked/linked.module').then(m => m.LinkedPageModule),
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
  declarations: [ToolsPage],
})
export class ToolsPageModule {}
