import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ModalController } from '@ionic/angular';
import { coinNames } from '@simplio/backend/api/utils/coins';
import { TransactionProgressItem } from 'src/app/components/list-items/sio-transaction-progress/sio-transaction-progress.component';
import { Translate } from 'src/app/providers/translate/';
import { UtilsService } from 'src/app/services/utils.service';
import { SvgIcon } from 'src/assets/icon/icons.js';
import { OrdersResponse, OrderStatus } from '../../../interface/swipelux';
import { SwipeluxService } from '../../../services/swipelux/swipelux.service';

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
    private utils: UtilsService,
    private modalCtr: ModalController,
    private utilsService: UtilsService,
    private loadingCtrl: LoadingController,
    private swipeluxService: SwipeluxService,
    public $: Translate,
  ) {}

  ngOnInit() {
    import('src/assets/icon/icons.js').then(mod => {
      const coin = !!this.purchase.toCcy.a3 ? this.purchase.toCcy.a3.toUpperCase() : coinNames.SIO;
      const m = mod[coin] as SvgIcon;
      this._walletColor = m?.graph;
    });
  }

  async continueWithPayment() {
    const loading = await this.loadingCtrl.create();
    loading.present();

    const order = await this.swipeluxService.getCurrentOrder().catch(e => null);

    loading.dismiss();
    if (!!order) {
      this.router.navigate(['home', 'purchase', 'summary'], {
        state: {
          order,
        },
      });
    } else {
      this.utils.showToast('No active order, please create new one.', 3000, 'warning');
    }
  }

  async dismiss() {
    await this.modalCtr.dismiss();
  }

  get walletColor(): string {
    return this._walletColor;
  }

  get canContinueToPurchase(): boolean {
    return (
      this.status === OrderStatus.PAYMENT_INIT || this.status === OrderStatus.PAYMENT_ROLLBACK_INIT
    );
  }

  get isCancelRequested(): boolean {
    return this.purchase.status === OrderStatus.CANCELLED;
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
