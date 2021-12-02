import { Component, Input, HostBinding, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'sio-floating-header',
  templateUrl: './sio-floating-header.component.html',
  styleUrls: ['./sio-floating-header.component.scss'],
})
export class SioFloatingHeaderComponent implements OnChanges {
  @Input() @HostBinding('class.has-bg') showContent = false;
  @Input() @HostBinding('class.title-center') titlePosition = false;

  constructor() {}

  ngOnChanges(changes: SimpleChanges) {
    if (!changes.showContent) {
      return;
    }
    this.showContent = changes.showContent.currentValue;
  }
}
