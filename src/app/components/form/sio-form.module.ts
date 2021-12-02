import { NgModule } from '@angular/core';
// components
import { SioValueComponent } from './sio-value/sio-value.component';
import { SioSwapValueComponent } from './sio-swap-value/sio-swap-value.component';
import { SioNumpadComponent } from './sio-numpad/sio-numpad.component';

// modules
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SioSharedModule } from '../shared/sio-shared.module';
import { SioRocketComponent } from './sio-rocket/sio-rocket.component';
import { SioStepperComponent } from './sio-stepper/sio-stepper.component';
import { SioSelectButtonComponent } from './sio-select-button/sio-select-button.component';
import { SioFormatedInputComponent } from './sio-formated-input/sio-formated-input.component';
import { SioPinValueComponent } from './sio-pin-value/sio-pin-value.component';
import { SioBuyValueComponent } from 'src/app/components/form/sio-buy-value/sio-buy-value.component';
import { SioPasswordComponent } from 'src/app/components/form/sio-password/sio-password.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, FormsModule, IonicModule, SioSharedModule],
  declarations: [
    SioValueComponent,
    SioSwapValueComponent,
    SioBuyValueComponent,
    SioNumpadComponent,
    SioRocketComponent,
    SioStepperComponent,
    SioSelectButtonComponent,
    SioFormatedInputComponent,
    SioPinValueComponent,
    SioPasswordComponent,
  ],
  exports: [
    SioValueComponent,
    SioSwapValueComponent,
    SioBuyValueComponent,
    SioNumpadComponent,
    SioRocketComponent,
    SioStepperComponent,
    SioSelectButtonComponent,
    SioFormatedInputComponent,
    SioPinValueComponent,
    SioPasswordComponent,
  ],
})
export class SioFormModule {}
