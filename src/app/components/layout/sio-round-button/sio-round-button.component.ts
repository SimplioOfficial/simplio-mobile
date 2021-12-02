import { Component, HostBinding } from '@angular/core';

@Component({
  selector: 'sio-round-button',
  templateUrl: './sio-round-button.component.html',
  styleUrls: ['./sio-round-button.component.scss'],
})
export class SioRoundButtonComponent {
  @HostBinding('class.ion-activatable')
  @HostBinding('class.ripple-parent')
  ngOnInit() {}
}
