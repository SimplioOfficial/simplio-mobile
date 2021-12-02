import { Component, HostBinding, Input, OnInit } from '@angular/core';

@Component({
  selector: 'sio-section-header-button',
  templateUrl: './sio-section-header-button.component.html',
  styleUrls: ['./sio-section-header-button.component.scss'],
})
export class SioSectionHeaderButtonComponent implements OnInit {
  @Input('has-border')
  @HostBinding('class.has-border')
  hasBorder = true;

  @Input('has-offset')
  @HostBinding('class.has-offset')
  hasOffset = false;

  @HostBinding('class.ion-activatable')
  @HostBinding('class.ripple-parent')
  ngOnInit() {}
}
