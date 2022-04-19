import { Component, Input } from '@angular/core';
import {
  SwapReportItem,
  SwapStatus,
  SwapStatusText,
  SwapStatusTranslations,
} from 'src/app/interface/swap';

@Component({
  selector: 'sio-swap-pending-item',
  templateUrl: './sio-swap-pending-item.component.html',
  styleUrls: ['./sio-swap-pending-item.component.scss', '../generic-swap-item.scss'],
})
export class SioSwapPendingItemComponent {
  readonly radius = 30;

  @Input() progress = 70;
  @Input() rate = 1;
  @Input() currency = 'usd';
  @Input() locale = 'en';
  @Input() transaction: SwapReportItem;
  @Input() translations: SwapStatusTranslations = null;
  @Input('issue-text') issueText = '';

  private _color: string = null;
  get color(): string {
    return this._color;
  }

  get status(): string {
    if (!this.transaction && !this.translations) return '';
    if (!this.transaction.Cancelled) return this.translations[this.transaction.Status];
    return `${this.translations[SwapStatusText.Failed]} (${
      this.translations[this.transaction.Status]
    })`;
  }

  get fiatValue() {
    return this.transaction.TargetWithdrawalAmount * this.rate;
  }

  get progressValue(): SwapStatus {
    return SwapStatus[this.transaction.Status];
  }

  get hasIssue(): boolean {
    const reactTo: SwapStatusText[] = [SwapStatusText.Delayed];
    return reactTo.includes(this.transaction?.Status);
  }

  updateColor(color: string) {
    this._color = color;
  }
}
