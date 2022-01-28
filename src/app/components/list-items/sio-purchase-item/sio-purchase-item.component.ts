import { Component, Input } from '@angular/core';
import { NotificationType } from 'src/app/components/list-items/sio-wallet-item/sio-wallet-item.component';
import { OrdersResponse } from '../../../interface/swipelux';

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
}
