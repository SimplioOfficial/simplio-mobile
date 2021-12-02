import { Component, Input, OnInit } from '@angular/core';
import { LoadingController, ModalController } from '@ionic/angular';
import { copyInputMessage, pipeAmount, UtilsService } from 'src/app/services/utils.service';
import { Translate } from 'src/app/providers/translate/';
import { SwapReportItem, SwapStatus, SwapStatusText, SwapType } from 'src/app/interface/swap';
import { SingleSwapService } from 'src/app/services/swap/single-swap.service';
import { TransactionProgressItem } from 'src/app/components/list-items/sio-transaction-progress/sio-transaction-progress.component';
import { SvgIcon } from 'src/assets/icon/icons.js';
import { Action } from 'src/app/components/list-items/sio-action-item/sio-action-item.component';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { getSwapStatusTranslations, getWalletType } from 'src/app/services/swap/utils';
import { coinNames } from '../../../services/api/coins';
import { WalletService } from 'src/app/services/wallet.service';
import { getPrice } from '../../../services/wallets/utils';
import { Rate, WalletType } from '../../../interface/data';
import { RateService } from '../../../services/apiv2/connection/rate.service';

@Component({
  selector: 'swap-detail-modal',
  templateUrl: './swap-detail.modal.html',
  styleUrls: ['./swap-detail.modal.scss'],
})
export class SwapDetailModal implements OnInit {
  @Input() swapTx: SwapReportItem;
  @Input() progress = 0;

  expanded = false;
  txFeePipe;
  items: TransactionProgressItem[] = [];
  private _actions = new BehaviorSubject<Action[]>([]);
  actions$ = this._actions.asObservable();
  private rate: Rate[] = [];

  readonly swapStatusTranslations = getSwapStatusTranslations(this.$);
  readonly statusValue = {
    [SwapStatusText.Validating]: 1,
    [SwapStatusText.Pending]: 2,
    [SwapStatusText.Swapping]: 3,
    [SwapStatusText.Withdrawing]: 4,
    [SwapStatusText.Completed]: 5,
    [SwapStatusText.Failed]: 1000,
  };
  constructor(
    private router: Router,
    private singleSwap: SingleSwapService,
    private utilsService: UtilsService,
    private rateService: RateService,
    private walletService: WalletService,
    private modalCtr: ModalController,
    private loadingCtr: LoadingController,
    public $: Translate,
  ) {}

  private _walletColor = '';

  get walletColor(): string {
    return this._walletColor;
  }

  get targetWallet(): string {
    return this.swapTx.TargetAddress;
  }

  get targetCoin(): string {
    return this.swapTx.TargetCurrency;
  }

  get targetNetwork(): string {
    return this.swapTx.TargetCurrencyNetwork
      ? this.swapTx.TargetCurrencyNetwork
      : this.swapTx.Status;
  }

  get sourceWallet(): string {
    return this.swapTx.SourceRefundAddress;
  }

  get sourceCoin(): string {
    return this.swapTx.SourceCurrency;
  }

  get sourceNetwork(): string {
    return this.swapTx.SourceCurrencyNetwork
      ? this.swapTx.SourceCurrencyNetwork
      : this.swapTx.Status;
  }

  get sourceAmount(): number {
    return this.swapTx.SourceInitialAmount;
  }

  get targetAmount(): number {
    return this.swapTx.UserAgreedAmount;
  }

  // get targetPrice(): string {
  //   const price = this.swapTx.SourceInitialAmount / this.swapTx.TargetWithdrawalAmount;
  //   const type = getWalletType(this.sourceCoin, this.sourceNetwork);
  //   const sourceWallet = this.walletService.getWalletByCoinType(this.sourceCoin, type);
  //   const decimal = Math.min(sourceWallet?.decimal || 8, 8);

  //   return this.swapTx.TargetPrice
  //     ? parseFloat((1 / price).toFixed(decimal)).toString() + ' ' + this.targetCoin
  //     : this.swapTx.Status;
  // }

  get swapFee() {
    return this.swapTx.TotalSwapFee;
  }

  get progressValue(): SwapStatus {
    return SwapStatus[this.swapTx.Status];
  }

  get status(): string {
    return this.swapStatusTranslations[this.swapTx.Status];
  }

  get startedAt(): Date {
    return new Date(this.swapTx.StartedAt ?? 0);
  }

  get completedAt(): Date {
    return new Date(
      this.swapTx.UpdatedAtUnixTime
        ? this.swapTx.UpdatedAtUnixTime * 1000
        : this.swapTx.StartedAtUnixTime * 1000,
    );
  }

  get isFinished(): boolean {
    return this.swapStatusTranslations[this.swapTx.Status] === SwapStatusText.Completed;
  }

  get isSingle(): boolean {
    return this.swapTx.SwapType === SwapType.Single;
  }

  get isCancelRequested(): boolean {
    return this.swapTx.Cancelled;
  }

  get sourceFiat() {
    return this.sourceAmount * this.getPrice(this.swapTx.SourceCurrency, 'USD');
  }

  get targetWithdrawalAmount() {
    return this.swapTx.TargetPurchasedAmount;
  }

  get transactionFee() {
    return this.swapTx.SourceTxFee;
  }

  get transactionFeeToSource() {
    return this.txFeePipe?.ticker
      ? (this.transactionFee * this.getPrice(this.txFeePipe.ticker, 'USD')) /
          this.getPrice(this.swapTx.SourceCurrency, 'USD')
      : 0;
  }

  get withdrawalFeeToSource() {
    return (
      (this.swapTx.TargetWithdrawalFee * this.getPrice(this.swapTx.TargetCurrency, 'USD')) /
      this.getPrice(this.swapTx.SourceCurrency, 'USD')
    );
  }

  get withdrawalFee() {
    return this.swapTx.TargetWithdrawalFee;
  }

  get targetFiat() {
    return this.swapTx.TargetInitialAmountInFiat;
  }

  get totalFee() {
    return this.withdrawalFeeToSource + this.transactionFeeToSource + this.swapFee;
  }

  get totalFeeFiat() {
    return this.totalFee * this.getPrice(this.swapTx.SourceCurrency, 'USD');
  }

  get transactionFeeTicker() {
    return this.swapTx.SourceCurrency;
  }

  ngOnInit() {
    import('src/assets/icon/icons.js').then(mod => {
      const coin = !!this.swapTx.TargetCurrency
        ? this.swapTx.TargetCurrency.toUpperCase()
        : coinNames.SIO;
      const m = mod[coin] as SvgIcon;
      this._walletColor = m?.graph;
    });

    this.items = [
      {
        text: this.$.instant(this.$.SWAP_STATUS_START),
        label: this.$.instant(this.$.SWAP_STATUS_START_LABEL),
        isActive: false,
        isFilled: true,
      },
      {
        text: this.$.instant(this.$.SWAP_STATUS_VALIDATING),
        label: this.$.instant(this.$.SWAP_STATUS_VALIDATING_LABEL),
        isActive: this.swapTx.Status === SwapStatusText.Validating,
        isFilled: this.statusValue[this.swapTx.Status] > 0,
      },
      {
        text: this.$.instant(this.$.SWAP_STATUS_PENDING),
        label: this.$.instant(this.$.SWAP_STATUS_PENDING_LABEL),
        isActive: this.swapTx.Status === SwapStatusText.Pending,
        isFilled: this.statusValue[this.swapTx.Status] > 1,
      },
      {
        text: this.$.instant(this.$.SWAP_STATUS_SWAPPING),
        label: this.$.instant(this.$.SWAP_STATUS_SWAPPING_LABEL),
        isActive: this.swapTx.Status === SwapStatusText.Swapping,
        isFilled: this.statusValue[this.swapTx.Status] > 2,
      },
      {
        text: this.$.instant(this.$.SWAP_STATUS_WITHDRAWING),
        label: this.$.instant(this.$.SWAP_STATUS_WITHDRAWING_LABEL),
        isActive: this.swapTx.Status === SwapStatusText.Withdrawing,
        isFilled: this.statusValue[this.swapTx.Status] > 3,
      },
      {
        text: this.$.instant(this.$.SWAP_STATUS_COMPLETED),
        label: this.$.instant(this.$.SWAP_STATUS_COMPLETED_LABEL),
        isActive: this.swapTx.Status === SwapStatusText.Completed,
        isFilled: this.statusValue[this.swapTx.Status] > 4,
      },
    ];

    this.rate = this.rateService.rateValue;

    const walletType = getWalletType(this.swapTx.SourceCurrency, this.swapTx.SourceCurrencyNetwork);
    this.txFeePipe = {
      type: walletType,
      ticker: this.swapTx.SourceCurrency,
    };

    switch (this.txFeePipe.type) {
      case WalletType.BSC_TOKEN:
        this.txFeePipe = {
          ticker: coinNames.BNB,
          type: WalletType.BSC,
          decimal: 18,
        };
        break;
      case WalletType.SOLANA_TOKEN:
      case WalletType.SOLANA_TOKEN_DEV:
        this.txFeePipe = {
          ticker: coinNames.SOL,
          type: WalletType.SOLANA,
          decimal: 9,
        };
        break;
      case WalletType.ETH_TOKEN:
        this.txFeePipe = {
          ticker: coinNames.ETH,
          type: WalletType.ETH,
          decimal: 18,
        };
        break;
      default:
        break;
    }
  }

  copySagaId(tx: SwapReportItem) {
    copyInputMessage(tx.SagaId);
    this.utilsService.showToast(this.$.COPIED_TO_CLIPBOARD);
  }

  cancelSwapTransaction() {
    this._openAlertOnCancel();
  }

  async dismiss() {
    await this.modalCtr.dismiss();
  }

  private async _openAlertOnCancel() {
    await this.utilsService.presentAlert({
      subHeader: this.$.DO_YOU_AGREE,
      message: this.$.CANCEL_FEES_WILL_BE_APPLIED,
      buttons: [
        {
          text: this.$.BACK,
          role: 'cancel',
        },
        {
          text: this.$.CONTINUE,
          handler: () => this._cancelSwap(),
        },
      ],
    });
  }

  private async _cancelSwap() {
    const loading = await this.loadingCtr.create();
    await loading.present();

    try {
      await this.singleSwap.cancel(this.swapTx.SagaId);
      await this.modalCtr.dismiss(true);
    } catch (err) {
      await this.utilsService.showToast(this.$.CANCELING_HAS_FAILED, 1500, 'warning');
    } finally {
      await loading.dismiss();
    }
  }

  private getPrice(ticker: string, currency: string): number {
    return getPrice(this.rate, ticker, currency);
  }
}
