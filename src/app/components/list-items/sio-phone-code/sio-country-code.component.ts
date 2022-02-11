import { Component, OnInit, Input, EventEmitter, Output, HostListener } from '@angular/core';

@Component({
  selector: 'sio-country-code',
  templateUrl: './sio-country-code.component.html',
  styleUrls: ['./sio-country-code.component.scss'],
})
export class SioCountryCodeComponent implements OnInit {
  @Input() flag = '';
  @Input() code = '';
  @Input() name = '';
  @Output() select: EventEmitter<string> = new EventEmitter();

  constructor() {}

  ngOnInit() {}

  @HostListener('click')
  onClick() {
    this.select.emit(this.code);
  }
}
