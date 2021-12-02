import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { SioLayoutModule } from 'src/app/components/layout/sio-layout.module';
import { AdvancedWalletsPage } from './advanced-wallets.page';
import { ResponsibilityAgreementGuard } from '../../../../guards/responsibility-agreement.guard';

const routes: Routes = [
  {
    path: '',
    component: AdvancedWalletsPage,
  },
  {
    path: 'import-recovery',
    canActivate: [ResponsibilityAgreementGuard],
    loadChildren: () =>
      import('./import-recovery/import-recovery.module').then(m => m.ImportRecoveryPageModule),
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SioLayoutModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild({
      extend: true,
    }),
  ],
  providers: [BarcodeScanner],
  declarations: [AdvancedWalletsPage],
})
export class AdvancedWalletsPageModule {}
