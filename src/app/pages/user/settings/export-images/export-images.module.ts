import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ExportImagesPage } from './export-images.page';
import { SioLayoutModule } from 'src/app/components/layout/sio-layout.module';
import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';

const routes: Routes = [
  {
    path: '',
    component: ExportImagesPage,
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SioLayoutModule,
    NgxQRCodeModule,
    RouterModule.forChild(routes),
  ],
  declarations: [ExportImagesPage],
})
export class ExportImagesPageModule {}
