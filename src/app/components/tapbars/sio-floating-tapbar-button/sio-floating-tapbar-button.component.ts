import { Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'sio-floating-tapbar-button',
  templateUrl: './sio-floating-tapbar-button.component.html',
  styleUrls: ['./sio-floating-tapbar-button.component.scss'],
})
export class SioFloatingTapbarButtonComponent {

  @Input() title = '';

  @HostBinding('class') class = 'ion-activatable ripple-parent';
  ngOnInit() {}

}

