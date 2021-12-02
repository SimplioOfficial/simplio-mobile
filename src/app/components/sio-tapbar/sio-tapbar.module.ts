import { NgModule } from '@angular/core';
// Components
import { SioTapbarComponent } from './sio-tapbar.component';
import { SioTapButtonComponent } from './sio-tap-button/sio-tap-button.component';
import { SioTapActionComponent } from './sio-tap-action/sio-tap-action.component';
// Modules
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [IonicModule, CommonModule, RouterModule],
  declarations: [SioTapbarComponent, SioTapButtonComponent, SioTapActionComponent],
  exports: [SioTapbarComponent, SioTapButtonComponent, SioTapActionComponent],
})
export class SioTapbarModule {}
