import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { coinNames } from '@simplio/backend/api/utils/coins';
import { UtilsService } from 'src/app/services/utils.service';
import { Translate } from 'src/app/providers/translate/';
import { TransactionProgressItem } from 'src/app/components/list-items/sio-transaction-progress/sio-transaction-progress.component';
import { SvgIcon } from 'src/assets/icon/icons.js';
import { OrdersResponse } from '../../../interface/swipelux';

@Component({
  selector: 'purchase-detail-modal',
  templateUrl: './purchase-detail.modal.html',
  styleUrls: ['./purchase-detail.modal.scss'],
})
export class PurchaseDetailModal implements OnInit {
  @Input() purchase: OrdersResponse;
  @Input() progress = 0;

  expanded = false;
  locale = 'USD';
  items: TransactionProgressItem[] = [];

  private _walletColor = '';

  constructor(
    private router: Router,
    private utilsService: UtilsService,
    private modalCtr: ModalController,
    public $: Translate,
  ) {}

  ngOnInit() {
    import('src/assets/icon/icons.js').then(mod => {
      const coin = !!this.purchase.toCcy.a3 ? this.purchase.toCcy.a3.toUpperCase() : coinNames.SIO;
      const m = mod[coin] as SvgIcon;
      this._walletColor = m?.graph;
    });
  }

  async dismiss() {
    await this.modalCtr.dismiss();
  }

  get walletColor(): string {
    return this._walletColor;
  }

  get isCancelRequested(): boolean {
    return this.purchase.status === 'canceled';
  }

  get merchantFee() {
    return 0;
  }

  get sourceAmount(): number {
    return this.purchase.fromAmount;
  }

  get sourceCoin(): string {
    return this.purchase.fromCcy.a3;
  }

  get startedAt(): Date {
    return this.purchase.createdAt;
  }

  get status(): string {
    return this.purchase.status;
  }

  get targetAmount(): number {
    return this.purchase.toAmount;
  }

  get targetCoin(): string {
    return this.purchase.toCcy.a3;
  }

  get targetWallet(): string {
    return this.purchase.wallet;
  }

  get totalFee() {
    return this.withdrawalFee + this.transactionFee + this.merchantFee;
  }

  get transactionFee() {
    return 0;
  }

  get withdrawalFee() {
    return 0;
  }
}
