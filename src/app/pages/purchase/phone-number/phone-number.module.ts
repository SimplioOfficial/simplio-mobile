import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { SioFormModule } from '../../../components/form/sio-form.module';
import { SioLayoutModule } from '../../../components/layout/sio-layout.module';
import { SioListModule } from '../../../components/list-items/sio-list.module';
import { CountryListModal } from '../../modals/country-list-modal/country-list.modal';
import { PhoneNumberPage } from './phone-number.page';

const routes: Routes = [
  {
    path: '',
    component: PhoneNumberPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild({
      extend: true
    }),
    SioFormModule,
    SioLayoutModule,
    SioListModule
  ],
  declarations: [PhoneNumberPage, CountryListModal]
})
export class PhoneNumberPageModule {}
