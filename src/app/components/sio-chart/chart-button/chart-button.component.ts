import { Component, Input, HostBinding } from '@angular/core';

@Component({
  selector: 'chart-button',
  templateUrl: './chart-button.component.html',
  styleUrls: ['./chart-button.component.scss'],
})
export class ChartButtonComponent {
  @Input() title: string;
  @Input() @HostBinding('class.is-active') isActive: boolean;

  constructor() {}
}
