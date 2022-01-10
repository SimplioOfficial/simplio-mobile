import { Component, ElementRef, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { AnimationController, ModalController } from '@ionic/angular';
import { Translate } from 'src/app/providers/translate';

type Action = {
  buttonText: string;
  buttonIcon: string;
  desc: string;
  commingSoon?: boolean;
};

@Component({
  selector: 'init-tutorial-modal',
  templateUrl: './init-tutorial.modal.html',
  styleUrls: ['./init-tutorial.modal.scss'],
})
export class InitTutorialModal {
  readonly ACTIONS: Action[] = [
    {
      buttonText: this.$.SEND,
      buttonIcon: 'arrow-up',
      desc: this.$.TUT_INIT_SEND,
    },
    {
      buttonText: this.$.RECEIVE,
      buttonIcon: 'arrow-down',
      desc: this.$.TUT_INIT_RECEIVE,
    },
    {
      buttonText: this.$.SWAP,
      buttonIcon: 'repeat',
      desc: this.$.TUT_INIT_SWAP,
    },
    {
      buttonText: this.$.STAKING,
      buttonIcon: 'flash',
      desc: this.$.TUT_INIT_STAKING,
    },

  ];

  get buttonText(): string {
    switch (this.pageNumber) {
      case 1:
        return this.$.NEXT;
      default:
        return this.$.DONE;
    }
  }

  @ViewChild('overview') overview: ElementRef<HTMLDivElement>;
  @ViewChild('actions') actions: ElementRef<HTMLDivElement>;
  @ViewChild('tap') tap: ElementRef<HTMLDivElement>;
  @ViewChildren('index') index: QueryList<ElementRef<HTMLSpanElement>>;

  pageNumber = 1;

  get hasBlinky(): boolean {
    return this.pageNumber === 1;
  }

  private _overviewAnim = this.animCtrl
    .create()
    .duration(150)
    .keyframes([
      {
        offset: 0,
        opacity: 0,
      },
      {
        offset: 1,
        opacity: 1,
      },
    ]);

  private _actionsAnim = this.animCtrl
    .create()
    .duration(800)
    .easing('ease-in-out')
    .keyframes([
      {
        offset: 0,
        transform: 'translateY(100%)',
      },
      {
        offset: 0.45,
        transform: 'translateY(-5%)',
      },
      {
        offset: 1,
        transform: 'translateY(0%)',
      },
    ]);

  private _tapAnim = this.animCtrl
    .create()
    .duration(2000)
    .easing('ease-in-out')
    .keyframes([
      {
        offset: 0,
        transform: 'translate(150%, -150%) scale(1)',
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

  constructor(
    private modalCtrl: ModalController,
    private animCtrl: AnimationController,
    public $: Translate,
  ) {}

  private async _runAnimation() {
    const $tap = this.tap.nativeElement;
    const $actions = this.actions.nativeElement;
    const $overview = this.overview.nativeElement;

    await this._tapAnim.addElement($tap).play();

    await this._overviewAnim.addElement($overview).play();

    await this._actionsAnim.addElement($actions).play();

    for (const [i, el] of this.index.toArray().entries()) {
      this.animCtrl
        .create()
        .addElement(el.nativeElement)
        .easing('ease-in-out')
        .duration(2000)
        .delay(250 * i)
        .from('opacity', 0)
        .to('opacity', 1)
        .play();
    }
  }

  private async _onPageOne() {
    this.pageNumber = 2;
    await this._runAnimation();
  }
  private async _onPageTwo() {
    await this.modalCtrl.dismiss(true);
  }

  async onClick() {
    switch (this.pageNumber) {
      case 1:
        return await this._onPageOne();
      default:
        return await this._onPageTwo();
    }
  }
}
