import { Component, OnInit, Input, HostBinding } from '@angular/core';

@Component({
  selector: 'sio-header',
  templateUrl: './sio-header.component.html',
  styleUrls: ['./sio-header.component.scss'],
})
export class SioHeaderComponent implements OnInit {
  @Input() back = false;
  @Input() background = false;
  @Input() isOpen = false;

  @HostBinding('class.has-border') @Input() hasBorder = false;
  @HostBinding('class.has-background') @Input() hasBackground = false;

  constructor() {}

  ngOnInit() {}
}
