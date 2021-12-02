import { Component, EventEmitter, HostBinding, Input, OnInit, Output } from '@angular/core';

enum TYPES {
  SMALL = 'small',
  LARGE = 'large',
}

@Component({
  selector: 'sio-numpad',
  templateUrl: './sio-numpad.component.html',
  styleUrls: ['./sio-numpad.component.scss'],
})
export class SioNumpadComponent implements OnInit {
  static TYPES = TYPES;

  @Input('display-back') displayBack = true;
  @Input('display-dot') displayDot = true;
  @Output() changed = new EventEmitter<number>();

  @Input('num-type') private _numType = TYPES.LARGE;
  @HostBinding('attr.data-type') get numType() {
    return this._numType ?? TYPES.LARGE;
  }

  constructor() {}

  ngOnInit() {}

  numpadBack() {
    this.changed.emit(-1);
  }

  numpadDot() {
    this.changed.emit(10);
  }

  async onPress1() {
    this.changed.emit(1);
  }

  async onPress2() {
    this.changed.emit(2);
  }

  async onPress3() {
    this.changed.emit(3);
  }

  async onPress4() {
    this.changed.emit(4);
  }

  async onPress5() {
    this.changed.emit(5);
  }

  async onPress6() {
    this.changed.emit(6);
  }

  async onPress7() {
    this.changed.emit(7);
  }

  async onPress8() {
    this.changed.emit(8);
  }

  async onPress9() {
    this.changed.emit(9);
  }

  async onPress0() {
    this.changed.emit(0);
  }
}
