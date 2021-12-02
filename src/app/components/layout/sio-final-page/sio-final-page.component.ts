import {
  AfterViewInit,
  Component,
  ElementRef,
  HostBinding,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { AnimationController } from '@ionic/angular';
import { PredefinedColors } from '@ionic/core/dist/types/interface';

type PageOptions = {
  title: string;
  subtitle: string;
  icon: string;
  color: PredefinedColors;
  actionText: string;
  hasAction: boolean;
  action: (e: Event) => void;
};

export type FinalPageOptions = Partial<PageOptions>;

@Component({
  selector: 'sio-final-page',
  templateUrl: './sio-final-page.component.html',
  styleUrls: ['./sio-final-page.component.scss'],
})
export class SioFinalPageComponent implements OnInit, AfterViewInit {
  private _defaultOptions: FinalPageOptions = {
    action: _ => {},
    color: 'primary',
    icon: 'checkmark-outline',
    subtitle: '',
    title: '',
    actionText: '',
    hasAction: true,
  };
  @Input('options') private _inputOptions: PageOptions;
  options: FinalPageOptions = null;

  @HostBinding('attr.data-color') get dataColor() {
    return this.options.color;
  }

  @ViewChild('circleOne', { static: true }) $circleOne: ElementRef<HTMLDivElement>;
  @ViewChild('circleTwo', { static: true }) $circleTwo: ElementRef<HTMLDivElement>;
  @ViewChild('circleThree', { static: true }) $circleThree: ElementRef<HTMLDivElement>;

  constructor(private animCtrl: AnimationController) {}

  ngOnInit() {
    this.options = {
      ...this._defaultOptions,
      ...this._inputOptions,
    };
  }

  ngAfterViewInit() {
    this._runAnination();
  }

  private async _runAnination() {
    const circleOneAnim = this.animCtrl.create();
    const circleTwoAnim = this.animCtrl.create();
    const circleThreeAnim = this.animCtrl.create();
    const iconAnim = this.animCtrl.create();

    const d = iconAnim
      .addElement(this.$circleOne.nativeElement.querySelector('.icon'))
      .duration(250)
      .delay(600)
      .easing('ease-in-out')
      .keyframes([
        { offset: 0, top: 'calc(100% + 1em)' },
        { offset: 0.85, top: '40%' },
        { offset: 1, top: '50%' },
      ]);

    const a = circleOneAnim
      .addElement(this.$circleOne.nativeElement)
      .duration(800)
      .easing('ease-in-out')
      .keyframes([
        { offset: 0, transform: 'scale(0)' },
        { offset: 0.85, transform: 'scale(1.2)' },
        { offset: 1, transform: 'scale(1)' },
      ]);

    const b = circleTwoAnim
      .addElement(this.$circleTwo.nativeElement)
      .duration(750)
      .easing('ease-in-out')
      .keyframes([
        { offset: 0, transform: 'scale(0)' },
        { offset: 0.85, transform: 'scale(1.2)' },
        { offset: 1, transform: 'scale(1)' },
      ]);

    const c = circleThreeAnim
      .addElement(this.$circleThree.nativeElement)
      .duration(700)
      .easing('ease-in-out')
      .keyframes([
        { offset: 0, transform: 'scale(0)' },
        { offset: 0.85, transform: 'scale(1.2)' },
        { offset: 1, transform: 'scale(1)' },
      ]);

    a.play();
    d.play();
    b.play();
    c.play();
  }

  onClick(e) {
    this.options.action(e);
  }
}
