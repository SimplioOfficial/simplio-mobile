import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { SioFloatingTapbarComponent } from 'src/app/components/tapbars/sio-floating-tapbar/sio-floating-tapbar.component';
import { SioFloatingTapbarButtonComponent } from 'src/app/components/tapbars/sio-floating-tapbar-button/sio-floating-tapbar-button.component';

@NgModule({
  imports: [
	  IonicModule,
	  CommonModule, 
	  RouterModule
	],
  declarations: [SioFloatingTapbarComponent, SioFloatingTapbarButtonComponent],
  exports: [SioFloatingTapbarComponent, SioFloatingTapbarButtonComponent],
})
export class SioTapbarsModule {}

