import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { AnimationController } from '@ionic/angular';

@Component({
  selector: 'sio-swap-empty',
  templateUrl: './sio-swap-empty.component.html',
  styleUrls: ['./sio-swap-empty.component.scss'],
})
export class SioSwapEmptyComponent implements AfterViewInit {
  @ViewChild('thumb') $thumb: ElementRef<HTMLDivElement>;
  @ViewChild('bar') $bar: ElementRef<HTMLDivElement>;

  constructor(private animCtrl: AnimationController) {}

  ngAfterViewInit() {
    this._runAnimation();
  }

  private async _runAnimation() {
    const barAnim = this.animCtrl
      .create()
      .addElement(this.$bar.nativeElement)
      .duration(1000)
      .easing('ease-in-out')
      .keyframes([
        {
          offset: 0,
          transform: 'translateX(20px)',
          opacity: 0,
        },
        {
          offset: 1,
          transform: 'translateX(0)',
          opacity: 1,
        },
      ]);

    const thumbAnim = this.animCtrl
      .create()
      .addElement(this.$thumb.nativeElement)
      .duration(1000)
      .easing('ease-in-out')
      .keyframes([
        {
          offset: 0,
          transform: 'translateX(-20px)',
          opacity: 0,
        },
        {
          offset: 1,
          transform: 'translateX(0)',
          opacity: 1,
        },
      ]);

    thumbAnim.play();
    barAnim.play();

    // Promise.all([barAnim.play(), thumbAnim.play()])
  }
}
