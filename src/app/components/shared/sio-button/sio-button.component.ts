import {
  Component,
  OnInit,
  Input,
  ElementRef,
  ViewChild,
  Output,
  EventEmitter,
} from '@angular/core';

enum ButtonShapes {
  circle = 'circle',
  square = 'square',
}

export enum ButtonVariant {
  primary,
  secondary,
  outline,
}

@Component({
  selector: 'sio-button',
  templateUrl: './sio-button.component.html',
  styleUrls: ['./sio-button.component.scss'],
})
export class SioButtonComponent implements OnInit {
  @Input('no-padding') noPadding = false;
  @Input('has-shadow') hasShadow = false;
  @Input('is-block') isBlock = true;
  @Input() shape = ButtonShapes.square;
  @Input() disabled = false;
  @Input() variant = ButtonVariant.primary;

  @Output() action = new EventEmitter<any>();

  @ViewChild('sioButtonEl', { static: true }) sioButtonEl: ElementRef;

  constructor(private buttonEl: ElementRef) {}

  ngOnInit() {
    // Setting `Variant`
    this.buttonEl.nativeElement.classList.add(`is-${ButtonVariant[this.variant]}`);
    // Setting `Block`
    if (this.isBlock) {
      this.sioButtonEl.nativeElement.classList.add(`is-block`);
    }
    // Setting `Shadow`
    if (this.hasShadow) {
      this.sioButtonEl.nativeElement.classList.add(`has-shadow`);
    }
    // Setting `Padding`
    if (this.noPadding) {
      this.buttonEl.nativeElement.classList.add(`no-padding`);
    }
    if (this.shape) {
      this.sioButtonEl.nativeElement.classList.add(`is-${this.shape}`);
    }
  }

  onAction(e) {
    this.action.emit(e);
  }
}
