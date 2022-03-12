import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Translate } from 'src/app/providers/translate';
import { Router } from '@angular/router';
import { AnimationController } from '@ionic/angular';
import { AuthenticationProvider } from 'src/app/providers/data/authentication.provider';
import { TrackedPage } from '../../../../classes/trackedPage';

@Component({
  selector: 'account-lock-page',
  templateUrl: './account-lock.page.html',
  styleUrls: ['./account-lock.page.scss'],
})
export class AccountLockPage extends TrackedPage implements AfterViewInit {
  origin = this.router.getCurrentNavigation().extras?.state?.url || '/home/wallets';

  @ViewChild('checkRef') $check: ElementRef<HTMLDivElement>;
  @ViewChild('logoRef') $logo: ElementRef<HTMLDivElement>;
  @ViewChild('sendRef') $send: ElementRef<HTMLDivElement>;

  flyLineAnim = this.animCtrl
    .create()
    .duration(30000)
    .iterations(Infinity)
    .keyframes([
      {
        offset: 0,
        transform: 'translate3d(0, 0, 0) rotate(0)',
      },
      {
        offset: 0.25,
        transform: 'translate3d(10px, 10px, 0) rotate(40deg)',
      },
      {
        offset: 0.5,
        transform: 'translate3d(0, 0, 0) rotate(0)',
      },
      {
        offset: 0.75,
        transform: 'translate3d(-10px, -10px, 0) rotate(-20deg)',
      },
      {
        offset: 1,
        transform: 'translate3d(0, 0, 0) rotate(0)',
      },
    ]);

  jumpAnim = this.animCtrl
    .create()
    .duration(10000)
    .iterations(Infinity)
    .easing('ease-in-out')
    .keyframes([
      {
        offset: 0,
        transform: 'translateY(0)',
      },
      {
        offset: 0.25,
        transform: 'translateY(5px)',
      },
      {
        offset: 0.5,
        transform: 'translateY(0)',
      },
      {
        offset: 0.75,
        transform: 'translateY(-5px)',
      },
      {
        offset: 1,
        transform: 'translateY(0)',
      },
    ]);

  flyTriangleAnim = this.animCtrl
    .create()
    .duration(25000)
    .iterations(Infinity)
    .keyframes([
      {
        offset: 0,
        transform: 'translate3d(0, 0, 0) rotate(0)',
      },
      {
        offset: 0.25,
        transform: 'translate3d(-5px, 2px, 0) rotate(40deg)',
      },
      {
        offset: 0.5,
        transform: 'translate3d(0, 0, 0) rotate(0)',
      },
      {
        offset: 0.75,
        transform: 'translate3d(-3px, -5px, 0) rotate(-20deg)',
      },
      {
        offset: 1,
        transform: 'translate3d(0, 0, 0) rotate(0)',
      },
    ]);

  constructor(
    private animCtrl: AnimationController,
    private authProvider: AuthenticationProvider,
    private router: Router,
    public $: Translate,
  ) {
    super();
  }

  ngAfterViewInit() {
    this._runAnimation();
  }

  private async _runAnimation() {
    await Promise.all([
      this.flyLineAnim.addElement(this.$send.nativeElement).play(),
      this.jumpAnim.addElement(this.$check.nativeElement).play(),
      this.flyTriangleAnim.addElement(this.$logo.nativeElement).play(),
    ]);
  }

  cancel() {
    this.router.navigateByUrl(this.origin);
  }

  onSubmit() {
    this.router.navigate(['/home', 'user', 'account', 'kyc'], {
      state: {
        url: this.origin,
      },
    });
  }
}
