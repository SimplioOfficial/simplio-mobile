import { FiatPipe } from './../../pipes/fiat.pipe';
import { NgModule } from '@angular/core';
// Modules
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
// components
import { SioButtonComponent } from './sio-button/sio-button.component';
import { SioAvatarComponent } from './sio-avatar/sio-avatar.component';
// pipes
import { BalancePipe } from '../../pipes/balance.pipe';
import { AddressPipe } from '../../pipes/address.pipe';
import { SioCountryFlagComponent } from './sio-country-flag/sio-country-flag.component';
import { SioTentLogoComponent } from 'src/app/components/shared/sio-logo/sio-logo.component';
import { SioSpinnerComponent } from 'src/app/components/shared/sio-spinner/sio-spinner.component';

@NgModule({
  imports: [CommonModule, IonicModule],
  declarations: [
    SioButtonComponent,
    SioAvatarComponent,
    BalancePipe,
    AddressPipe,
    FiatPipe,
    SioCountryFlagComponent,
    SioTentLogoComponent,
    SioSpinnerComponent,
  ],
  exports: [
    SioButtonComponent,
    SioAvatarComponent,
    BalancePipe,
    AddressPipe,
    FiatPipe,
    TranslateModule,
    SioCountryFlagComponent,
    SioTentLogoComponent,
    SioSpinnerComponent,
  ],
})
export class SioSharedModule {}
