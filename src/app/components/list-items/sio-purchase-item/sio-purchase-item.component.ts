import { Component, Input } from '@angular/core';
import { NotificationType } from 'src/app/components/list-items/sio-wallet-item/sio-wallet-item.component';
import { OrdersResponse, OrderStatus } from '../../../interface/swipelux';
import { Translate } from '../../../providers/translate';

@Component({
  selector: 'sio-purchase-item',
  templateUrl: './sio-purchase-item.component.html',
  styleUrls: ['./sio-purchase-item.component.scss', '../generic-item.scss'],
})
export class SioPurchaseItemComponent {
  readonly NOTIFICATION_TYPES = NotificationType;

  @Input() purchase: OrdersResponse;
  @Input('wallet-type') walletType = 0;
  @Input() balace = 0;
  @Input() locale: string;
  @Input('unconfirmed-message') unconfirmedMsg = '';

  constructor(public $: Translate) {}

  get purchaseStatus(): string {
    let result;

    switch (this.purchase.status) {
      case OrderStatus.CANCELLED:
        result = this.$.instant(this.$.CANCELED);
        break;
      case OrderStatus.PAYMENT_INIT:
      case OrderStatus.PAYMENT_ROLLBACK_INIT:
      case OrderStatus.PROCESSING_INIT:
      case OrderStatus.WITHDRAWAL_INIT:
        result = this.$.instant(this.$.PENDING);
        break;
      case OrderStatus.EMAIL_VERIFICATION_FAILED:
      case OrderStatus.KYC_FAILED:
      case OrderStatus.PAYMENT_FAILED:
      case OrderStatus.PROCESSING_FAILED:
      case OrderStatus.ROLLBACK_FAILED:
      case OrderStatus.WITHDRAWAL_FAILED:
      case OrderStatus.PHONE_VERIFICATION_FAILED:
        result = this.$.instant(this.$.PURCHASE_FAILED);
        break;
      case OrderStatus.COMPLETED:
      default:
        result = this.$.instant(this.$.FINISHED);
        break;
    }

    return result;
  }
}
