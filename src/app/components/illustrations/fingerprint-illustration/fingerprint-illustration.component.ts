import { Component, Input } from '@angular/core';

@Component({
  selector: 'sio-fingerprint-illustration',
  templateUrl: './fingerprint-illustration.component.html',
  styleUrls: ['./fingerprint-illustration.component.scss'],
})
export class FingerprintIllustrationComponent {
  @Input('has-circle') circle = true;
}
