import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Translate } from 'src/app/providers/translate';
import { TrackedPage } from '../../../classes/trackedPage';
import { FinalPageOptions } from '../../../components/layout/sio-final-page/sio-final-page.component';

export enum PaymentStatus {
  SUCCESS,
  ERROR,
  EXPIRED,
  CANCELED,
}

@Component({
  selector: 'purchase-final-page',
  template: '<sio-final-page [options]="options"></sio-final-page>',
})
export class PurchaseFinalPage extends TrackedPage implements OnInit {
  status = this.router.getCurrentNavigation().extras.state?.status as PaymentStatus;

  options: FinalPageOptions;

  private _successOpts: FinalPageOptions = {
    title: this.$.instant(this.$.PAYMENT_SUCCESS_TITLE),
    subtitle: '',
    actionText: this.$.instant(this.$.DONE),
    icon: 'checkmark-outline',
    color: 'primary',
    action: () => this._redirect(),
  };
  private _failureOpts: FinalPageOptions = {
    title: this.$.instant(this.$.PAYMENT_FAILURE_TITLE),
    subtitle: this.$.instant(this.$.PAYMENT_FAILURE_DESC),
    actionText: this.$.instant(this.$.DONE),
    icon: 'close-outline',
    color: 'danger',
    action: () => this._redirect(),
  };
  private _expiredOpts: FinalPageOptions = {
    title: this.$.instant(this.$.PAYMENT_EXPIRED_TITLE),
    subtitle: this.$.instant(this.$.PAYMENT_EXPIRED_DESC),
    actionText: this.$.instant(this.$.DONE),
    icon: 'close-outline',
    color: 'warning',
    action: () => this._redirect(),
  };
  private _cancelledOpts: FinalPageOptions = {
    title: this.$.instant(this.$.PAYMENT_CANCELLED_TITLE),
    subtitle: this.$.instant(this.$.PAYMENT_CANCELLED_DESC),
    actionText: this.$.instant(this.$.DONE),
    icon: 'close-outline',
    color: 'warning',
    action: () => this._redirect(),
  };

  constructor(private router: Router, public $: Translate) {
    super();
  }

  ngOnInit() {
    switch (this.status) {
      case PaymentStatus.CANCELED:
        this.options = this._cancelledOpts;
        break;
      case PaymentStatus.ERROR:
        this.options = this._failureOpts;
        break;
      case PaymentStatus.EXPIRED:
        this.options = this._expiredOpts;
        break;
      case PaymentStatus.SUCCESS:
      default:
        this.options = this._successOpts;
    }
  }

  private _redirect() {
    this.router.navigate(['/home', 'swap'], {
      state: {
        tab: 'purchases',
      },
    });
  }
}
