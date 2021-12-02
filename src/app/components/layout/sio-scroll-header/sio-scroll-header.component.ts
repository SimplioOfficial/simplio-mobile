import { Component, Input, HostBinding, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'sio-scroll-header',
  templateUrl: './sio-scroll-header.component.html',
  styleUrls: ['./sio-scroll-header.component.scss'],
})
export class SioScrollHeaderComponent implements OnChanges {
  @Input() @HostBinding('class.has-bg') showContent = false;
  @Input() title = '';

  constructor() {}

  ngOnChanges(changes: SimpleChanges) {
    if (!changes.showContent) {
      return;
    }
    this.showContent = changes.showContent.currentValue;
  }
}
