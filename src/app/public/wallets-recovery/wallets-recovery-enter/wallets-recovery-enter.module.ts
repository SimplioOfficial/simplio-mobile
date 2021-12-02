import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { SioFormModule } from 'src/app/components/form/sio-form.module';
import { SioLayoutModule } from 'src/app/components/layout/sio-layout.module';
import { SioSharedModule } from 'src/app/components/shared/sio-shared.module';
import { InsertSeedModalModule } from 'src/app/pages/modals/insert-seed-modal/insert-seed.module';
import { WalletsRecoveryEnterPage } from './wallets-recovery-enter.page';

const routes: Routes = [
  {
    path: '',
    component: WalletsRecoveryEnterPage,
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SioLayoutModule,
    SioSharedModule,
    SioFormModule,
    InsertSeedModalModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild({
      extend: true,
    }),
  ],
  providers: [BarcodeScanner],
  declarations: [WalletsRecoveryEnterPage],
})
export class WalletsRecoveryEnterPageModule {}
