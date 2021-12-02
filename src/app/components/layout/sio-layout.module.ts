import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
// Modules
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// Components
import { SioSimplePageComponent } from './sio-simple-page/sio-simple-page.component';
import { SioSearchComponent } from './sio-search/sio-search.component';
import { SioHeaderComponent } from './sio-header/sio-header.component';
import { SioHeaderButtonComponent } from './sio-header-button/sio-header-button.component';
import { SioTickerComponent } from './sio-ticker/sio-ticker.component';
import { SioPageComponent } from './sio-page/sio-page.component';
import { SioFloatingHeaderComponent } from './sio-floating-header/sio-floating-header.component';
import { SioSectionHeaderComponent } from 'src/app/components/layout/sio-section-header/sio-section-header.component';
import { SioSectionHeaderButtonComponent } from 'src/app/components/layout/sio-section-header-button/sio-section-header-button.component';
import { SioFinalPageComponent } from 'src/app/components/layout/sio-final-page/sio-final-page.component';
import { SioRoundButtonComponent } from 'src/app/components/layout/sio-round-button/sio-round-button.component';
import { SioScrollHeaderComponent } from 'src/app/components/layout/sio-scroll-header/sio-scroll-header.component';

@NgModule({
  imports: [IonicModule, CommonModule, FormsModule],
  declarations: [
    SioSimplePageComponent,
    SioSearchComponent,
    SioHeaderComponent,
    SioHeaderButtonComponent,
    SioTickerComponent,
    SioPageComponent,
    SioFloatingHeaderComponent,
    SioSectionHeaderComponent,
    SioSectionHeaderButtonComponent,
    SioFinalPageComponent,
    SioRoundButtonComponent,
    SioScrollHeaderComponent,
  ],
  exports: [
    SioSimplePageComponent,
    SioHeaderComponent,
    SioHeaderButtonComponent,
    SioSearchComponent,
    SioPageComponent,
    SioFloatingHeaderComponent,
    SioSectionHeaderComponent,
    SioSectionHeaderButtonComponent,
    SioFinalPageComponent,
    SioRoundButtonComponent,
    SioScrollHeaderComponent,
  ],
})
export class SioLayoutModule {}
