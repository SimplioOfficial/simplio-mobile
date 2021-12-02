import { Component, HostBinding, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'sio-simple-page',
  templateUrl: './sio-simple-page.component.html',
  styleUrls: ['./sio-simple-page.component.scss'],
})
export class SioSimplePageComponent {
  @Input() scroll = true;
  @HostBinding('class.has-tapbar') @Input() hasTapbar = false;
  @HostBinding('class.has-header') @Input() hasHeader = true;
  @Output() refreshed = new EventEmitter();
  @Input() hasFooter = true;
  constructor() {}

  get refreshable(): boolean {
    return Boolean(!this.refreshed.observers.length);
  }

  onRefreshContent(e) {
    this.refreshed.emit(e);
  }
}
