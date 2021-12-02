import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Translate } from 'src/app/providers/translate/';
import { Router } from '@angular/router';
import { AnimationController, IonSlides } from '@ionic/angular';

@Component({
  selector: 'backup-intro-page',
  templateUrl: './backup-intro.page.html',
  styleUrls: ['./backup-intro.page.scss'],
})
export class BackupIntroPage implements AfterViewInit {
  private readonly url = this.router.getCurrentNavigation().extras.state?.url || '/home';

  @ViewChild('slides') slides: IonSlides;
  @ViewChild('tap') tap: ElementRef<HTMLDivElement>;

  slideAnim = this.animCtrl
    .create()
    .duration(2000)
    .easing('ease-in-out')
    .keyframes([
      {
        offset: 0,
        transform: 'translate(100%, 100%) scale(1)',
        backgroundColor: 'inherit',
        opacity: 0,
      },
      {
        offset: 0.2,
        transform: 'translate(0%, 0%) scale(1)',
        backgroundColor: 'inherit',
        opacity: 1,
      },
      {
        offset: 0.4,
        transform: 'translate(0%, 0%) scale(1)',
        backgroundColor: 'inherit',
        opacity: 1,
      },
      {
        offset: 0.6,
        transform: 'translate(0%, 0%) scale(.6)',
        backgroundColor: 'var(--ion-color-primary)',
        opacity: 1,
      },
      {
        offset: 0.8,
        transform: 'translate(0%, 0%) scale(1)',
        backgroundColor: 'inherit',
        opacity: 1,
      },
      {
        offset: 1,
        transform: 'translate(0%, 0%) scale(1)',
        backgroundColor: 'inherit',
        opacity: 1,
      },
    ]);

  slideOpts = {
    slidesPerView: 'auto',
    centeredSlides: true,
    allowTouchMove: false,
    loop: true,
    speed: 600,
  };

  constructor(private router: Router, public $: Translate, private animCtrl: AnimationController) {}

  ngAfterViewInit() {
    const el = this.tap.nativeElement;
    this.slideAnim.addElement(el);
    this.slideAnim.onFinish(() => this.slides.slideNext());

    this._runAnimation();
  }

  private async _runAnimation() {
    await this.slideAnim.play();

    setTimeout(async () => await this._runAnimation(), 1000);
  }

  onSubmit() {
    this.router.navigate(['/home', 'user', 'settings', 'backup', 'repeat'], {
      state: { url: this.url },
    });
  }
}
