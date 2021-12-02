import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'sio-stepper',
  templateUrl: './sio-stepper.component.html',
  styleUrls: ['./sio-stepper.component.scss'],
})
export class SioStepperComponent implements OnInit {
  @Input('current-page') page = 1;
  @Input('page-count') private _pages = 1;

  constructor() {}

  get pages(): Array<number> {
    const n = Math.abs(this._pages);
    const count = n > 0 ? n : 1;
    return Array.from(Array(count).keys()).map(i => ++i);
  }

  ngOnInit() {}
}
