import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ImportImagesPage } from './import-images.page';
import { SioLayoutModule } from 'src/app/components/layout/sio-layout.module';

const routes: Routes = [
  {
    path: '',
    component: ImportImagesPage,
  },
];

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, SioLayoutModule, RouterModule.forChild(routes)],
  declarations: [ImportImagesPage],
})
export class ImportImagesPageModule {}
