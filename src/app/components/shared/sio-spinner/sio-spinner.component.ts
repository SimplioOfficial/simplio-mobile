import { Component, HostBinding, Input, OnInit } from '@angular/core';

@Component({
  selector: 'sio-spinner',
  templateUrl: './sio-spinner.component.html',
  styleUrls: ['./sio-spinner.component.scss'],
})
export class SioSpinnerComponent implements OnInit {
  @Input() stroke = 2;

  @HostBinding('style.height.px')
  @HostBinding('style.width.px')
  @Input()
  size = 40;
  constructor() {}

  ngOnInit() {}
}
