import { Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { Animation, AnimationController } from '@ionic/angular';

@Component({
  selector: 'sio-rocket',
  templateUrl: './sio-rocket.component.html',
  styleUrls: ['./sio-rocket.component.scss'],
})
export class SioRocketComponent implements OnInit, AfterViewInit {
  starsAnim: Animation;
  rocketAnim: Animation;

  @ViewChild('rocket') rocket: ElementRef<SVGPathElement>;
  @ViewChild('starSmall1') starSmall1: ElementRef<SVGCircleElement>;
  @ViewChild('starSmall2') starSmall2: ElementRef<SVGCircleElement>;
  @ViewChild('starSmall3') starSmall3: ElementRef<SVGCircleElement>;

  @ViewChild('starLarge1') starLarge1: ElementRef<SVGCircleElement>;
  @ViewChild('starLarge2') starLarge2: ElementRef<SVGCircleElement>;
  @ViewChild('starLarge3') starLarge3: ElementRef<SVGCircleElement>;

  constructor(private animationCtrl: AnimationController) {}

  ngOnInit() {}

  ngAfterViewInit() {
    // Rocket
    const $rocket = this.rocket.nativeElement;

    // Small stars
    const $starSmall1 = this.starSmall1.nativeElement;
    const $starSmall2 = this.starSmall2.nativeElement;
    const $starSmall3 = this.starSmall3.nativeElement;

    // Large stars
    const $starLarge1 = this.starLarge1.nativeElement;
    const $starLarge2 = this.starLarge2.nativeElement;
    const $starLarge3 = this.starLarge3.nativeElement;

    // Rocket
    // -------------
    this.rocketAnim = this.animationCtrl
      .create()
      .addElement($rocket)
      .duration(820)
      .keyframes([
        { offset: 0, transform: `translate3d(-1px, 2px, 0)` },
        { offset: 0.2, transform: `translate3d(-3px, 5px, 0)` },
        { offset: 0.5, transform: `translate3d(2px, 0, 0)` },
        { offset: 0.6, transform: `translate3d(-4px, -2px, 0)` },
        { offset: 0.8, transform: `translate3d(2px, 2px, 0)` },
        { offset: 0.9, transform: `translate3d(-1px, 2px, 0)` },
      ])
      .iterations(Infinity);

    // Small stars
    // -------------
    const starSmall1Anim = this.animationCtrl
      .create('starSmall1Anim')
      .addElement($starSmall1)
      .duration(1200)
      .keyframes([
        { offset: 0, transform: `translateY(0)` },
        { offset: 1, transform: `translateY(400px)` },
      ])
      .iterations(Infinity);

    const starSmall2Anim = this.animationCtrl
      .create('starSmall2Anim')
      .addElement($starSmall2)
      .duration(1500)
      .keyframes([
        { offset: 0, transform: `translateY(0)` },
        { offset: 1, transform: `translateY(400px)` },
      ])
      .iterations(Infinity);

    const starSmall3Anim = this.animationCtrl
      .create('starSmall3Anim')
      .addElement($starSmall3)
      .duration(1800)
      .keyframes([
        { offset: 0, transform: `translateY(0)` },
        { offset: 1, transform: `translateY(400px)` },
      ])
      .iterations(Infinity);

    // Large stars
    // -------------
    const starLarge1Anim = this.animationCtrl
      .create('starLarge1Anim')
      .addElement($starLarge1)
      .duration(800)
      .keyframes([
        { offset: 0, transform: `translateY(0)` },
        { offset: 1, transform: `translateY(800px)` },
      ])
      .iterations(Infinity);

    const starLarge2Anim = this.animationCtrl
      .create('starLarge2Anim')
      .addElement($starLarge2)
      .duration(1400)
      .keyframes([
        { offset: 0, transform: `translateY(-200px)` },
        { offset: 1, transform: `translateY(1200px)` },
      ])
      .iterations(Infinity);

    const starLarge3Anim = this.animationCtrl
      .create('starLarge3Anim')
      .addElement($starLarge3)
      .duration(1200)
      .keyframes([
        { offset: 0, transform: `translateY(-200px)` },
        { offset: 1, transform: `translateY(1400px)` },
      ])
      .iterations(Infinity);

    // ------------------------------

    this.starsAnim = this.animationCtrl
      .create('starsAnim')
      .addAnimation([
        starSmall1Anim,
        starSmall2Anim,
        starSmall3Anim,
        starLarge1Anim,
        starLarge2Anim,
        starLarge3Anim,
      ]);
    this.starsAnim.play();
    this.rocketAnim.play();
  }
}
