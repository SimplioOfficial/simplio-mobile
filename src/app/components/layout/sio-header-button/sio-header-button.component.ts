import { Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'sio-header-button',
  templateUrl: './sio-header-button.component.html',
  styleUrls: ['./sio-header-button.component.scss'],
})
export class SioHeaderButtonComponent {
  @Input('has-blinky') @HostBinding('class.has-blinky') hasBlinky = false;
  @Input('navigate-to') navigateTo: Array<string> = [];
  @Input() back = false;
  @Input() enable = true;
  @Input('has-border') hasBorder = false;
  @Input('has-offset') hasOffset = true;

  @HostBinding('class') @Input('blinky-variant') blinkyVariant = 'primary';
}
