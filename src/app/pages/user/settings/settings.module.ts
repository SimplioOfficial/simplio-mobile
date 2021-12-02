import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { SioLayoutModule } from 'src/app/components/layout/sio-layout.module';
import { SettingsPage } from './settings.page';
import { TranslateModule } from '@ngx-translate/core';
import { FingerprintAIO } from '@ionic-native/fingerprint-aio/ngx';
import { SioListModule } from 'src/app/components/list-items/sio-list.module';

const routes: Routes = [
  {
    path: '',
    component: SettingsPage,
  },
  {
    path: 'change-pass',
    loadChildren: () =>
      import('./change-pass/change-pass.module').then(m => m.ChangePasswordPageModule),
    data: { tapbar: false },
  },
  {
    path: 'change-pin',
    loadChildren: () => import('./change-pin/change-pin.module').then(m => m.ChangePinPageModule),
    data: { tapbar: false },
  },
  {
    path: 'primary-wallet',
    loadChildren: () =>
      import('./primary-wallet/primary-wallet.module').then(m => m.PrimaryWalletPageModule),
    data: { tapbar: false },
  },
  {
    path: 'active-wallets',
    loadChildren: () =>
      import('./active-wallets/active-wallets.module').then(m => m.ActiveWalletsPageModule),
    data: { tapbar: false },
  },
  {
    path: 'advanced-wallets',
    loadChildren: () =>
      import('./advanced-wallets/advanced-wallets.module').then(m => m.AdvancedWalletsPageModule),
    data: { tapbar: false },
  },
  {
    path: 'about',
    loadChildren: () => import('./about/about.module').then(m => m.AboutPageModule),
    data: { tapbar: false },
  },
  {
    path: 'graph',
    loadChildren: () => import('./graph/graph.module').then(m => m.GraphPageModule),
    data: { tapbar: false },
  },
  {
    path: 'theme',
    loadChildren: () => import('./theme/theme.module').then(m => m.ThemePageModule),
    data: { tapbar: false },
  },
  {
    path: 'export-images',
    loadChildren: () =>
      import('./export-images/export-images.module').then(m => m.ExportImagesPageModule),
  },
  {
    path: 'import-images',
    loadChildren: () =>
      import('./import-images/import-images.module').then(m => m.ImportImagesPageModule),
  },
  {
    path: 'backup',
    loadChildren: () => import('./backup/backup.module').then(m => m.BackupPageModule),
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
  declarations: [SettingsPage],
  providers: [FingerprintAIO],
})
export class SettingsPageModule {}
