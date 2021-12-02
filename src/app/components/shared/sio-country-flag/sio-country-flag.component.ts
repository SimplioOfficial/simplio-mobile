import { Component, Input } from '@angular/core';

@Component({
  selector: 'sio-country-flag',
  templateUrl: './sio-country-flag.component.html',
  styleUrls: ['./sio-country-flag.component.scss'],
})
export class SioCountryFlagComponent {
  @Input('src') private _src = '';
  get src(): string {
    return this._src;
  }
}
