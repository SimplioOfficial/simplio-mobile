import { Component, Input } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'sio-tap-button',
  templateUrl: './sio-tap-button.component.html',
  styleUrls: ['./sio-tap-button.component.scss'],
})
export class SioTapButtonComponent {
  @Input() navigateTo: Array<string> = [];
  @Input() state: any;
  @Input('active-class') activeClass = 'is-active';
  @Input('current-url') url: Array<string> = [];
  @Input() title = '';

  get isActive(): boolean {
    const navUrl = this.navigateTo
      .join('/')
      .split('/')
      .filter(i => !!i);
    return navUrl.every(p => this.url.includes(p));
  }

  get disabled(): boolean {
    return !Boolean(this.navigateTo.length);
  }

  constructor(private navCtr: NavController) {}

  open() {
    this.navCtr.navigateRoot(this.navigateTo, { state: this.state });
  }
}
