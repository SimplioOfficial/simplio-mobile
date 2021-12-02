import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { OrderTypes, SwapReportItem, SwapReportPage, SwapStatusText } from 'src/app/interface/swap';

const completedStatuses = [SwapStatusText.Failed, SwapStatusText.Completed];
const filterPending = (i: SwapReportItem[]) => i.filter(i => !completedStatuses.includes(i.Status));

@Injectable()
export class SwapProvider {
  private _pendingSwaps = new BehaviorSubject<SwapReportItem[]>([]);
  allPendingSwaps$ = this._pendingSwaps.asObservable();
  pendingSwaps$ = this._pendingSwaps.pipe(map(filterPending));

  private _swapHistory = new BehaviorSubject<SwapReportPage>(null);
  swapHistory$ = this._swapHistory;

  private _swapData = new BehaviorSubject<any>(null);
  swapData$ = this._swapData;

  private _gettingsSwapData = new BehaviorSubject<boolean | null>(null);
  gettingsSwapData$ = this._gettingsSwapData;

  get pendingSwapValue(): SwapReportItem[] {
    return this._pendingSwaps.value;
  }

  get swapHistoryValue(): SwapReportPage {
    return this._swapHistory.value;
  }

  pushPendingSwaps(items: SwapReportItem[]): SwapReportItem[] {
    this._pendingSwaps.next(items);
    return items;
  }

  updatePendingSwap(item: SwapReportItem): SwapReportItem[] {
    const current = this._pendingSwaps.value || [];
    const exists = current.find(i => i.SagaId === item.SagaId);
    const updated = !!exists
      ? current.map(i => (i.SagaId === item.SagaId ? item : i))
      : [...current, item];
    this._pendingSwaps.next(updated);
    return updated;
  }

  pushSwapHistory(page: SwapReportPage): SwapReportPage {
    this._swapHistory.next(page);
    return page;
  }

  pushSwapData(data) {
    this._swapData.next(data);
  }

  updatePending(item: SwapReportItem): SwapReportItem[] {
    switch (item.OrderType) {
      case OrderTypes.SELL:
        return this.updatePendingSwap(item);
    }
  }

  updateSwapStatus(status: boolean | null) {
    this._gettingsSwapData.next(status);
  }

  clean() {
    this._pendingSwaps.next([]);
    this._swapHistory.next(null);
    this._swapData.next(null);
  }
}
