import { Component, HostBinding, HostListener, Input } from '@angular/core';

@Component({
  selector: 'sio-swap-pairs',
  templateUrl: './sio-swap-pairs.component.html',
  styleUrls: ['./sio-swap-pairs.component.scss'],
})
export class SioSwapPairsComponent {
  @Input() ticker = '';
  @Input() isToken = false;
  @Input() network = '';
  @Input() list: string[] = [];

  @HostBinding('class.is-open') isOpen = false;

  constructor() {}

  @HostListener('click')
  toggleOpen() {
    this.isOpen = !this.isOpen;
  }
}
