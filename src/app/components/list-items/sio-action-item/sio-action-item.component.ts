import { Component, HostBinding, HostListener, Input, OnInit } from '@angular/core';
import { PredefinedColors } from '@ionic/core';

export type Action = {
  title: string;
  subtitle?: string;
  icon: string;
  color: PredefinedColors;
  cssClass?: string;
  handler?: (e: Event) => void;
};

@Component({
  selector: 'sio-action-item',
  templateUrl: './sio-action-item.component.html',
  styleUrls: ['./sio-action-item.component.scss'],
})
export class SioActionItemComponent implements OnInit {
  @Input() action: Action = null;

  constructor() {}

  @HostBinding('class.ion-activatable')
  @HostBinding('class.ripple-parent')
  ngOnInit() {}

  @HostListener('click', ['$event'])
  onClick(e: Event) {
    if (!!this.action?.handler) this.action.handler(e);
  }
}
