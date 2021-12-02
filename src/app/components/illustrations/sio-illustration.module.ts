import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
// Modules
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// Components
import { SwapIllustrationComponent } from './swap-illustration/swap-illustration.component';
import { FingerprintIllustrationComponent } from './fingerprint-illustration/fingerprint-illustration.component';

@NgModule({
  imports: [IonicModule, CommonModule, FormsModule],
  declarations: [SwapIllustrationComponent, FingerprintIllustrationComponent],
  exports: [SwapIllustrationComponent, FingerprintIllustrationComponent],
})
export class SioIllustrationModule {}
