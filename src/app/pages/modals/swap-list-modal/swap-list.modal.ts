import { AfterContentInit, Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SwapPair } from 'src/app/interface/swap';
import { Translate } from 'src/app/providers/translate/';
import { CoinItem } from 'src/assets/json/coinlist';

type ReduceMapFn<T> = (acc: Map<string, string[]>, curr: T) => Map<string, string[]>;

export enum SwapListModalType {
  SINGLE,
}

export type SwapListModalProps = {
  list: SwapPair[];
  type: SwapListModalType;
  coins: CoinItem[];
};

@Component({
  selector: 'swap-list-modal',
  templateUrl: './swap-list.modal.html',
})
export class SwapListModal implements AfterContentInit {
  @Input() list: SwapPair[] = [];
  @Input() type: SwapListModalType = SwapListModalType.SINGLE;
  @Input() coins: CoinItem[] = [];

  readonly TYPE = SwapListModalType;

  swapMap: Map<string, string[]>;
  swapList: [string, string[]][];

  constructor(private modalCtrl: ModalController, public $: Translate) {}

  ngAfterContentInit(): void {
    this.swapMap = this._createList(this.list);
    this.swapList = [...this.swapMap.entries()];
    this.swapList.forEach(e => {
      if (e.length >= 1) e[1] = e[1].filter((value, index, self) => self.indexOf(value) === index);
    });
  }

  onDismissModal(): void {
    this.modalCtrl.dismiss();
  }

  filterCoin(list: [string, string[]][]): CoinItem[] {
    const l = list.map(i => i[0]);
    return this.coins.reduce<CoinItem[]>((acc, curr) => {
      if (l.includes(curr.ticker) && !acc.includes(curr)) acc.push(curr);
      return acc;
    }, []);
  }

  isToken(swapPair: SwapPair): boolean {
    return swapPair.SourceCurrency !== swapPair.SourceCurrencyNetwork;
  }

  hasMultipleNetworks(coin: string): boolean {
    return (
      [
        ...new Set(
          this.list.filter(a => a.SourceCurrency === coin).map(a => a.SourceCurrencyNetwork),
        ),
      ].length > 1
    );
  }

  getAvailableNetworks(coin: string): string[] {
    return [
      ...new Set(
        this.list.filter(a => a.SourceCurrency === coin).map(a => a.SourceCurrencyNetwork),
      ),
    ];
  }

  getAvailablePairsForNetwork(coin: string, network: string): string[] {
    return this.list
      .filter(a => a.SourceCurrency === coin && a.SourceCurrencyNetwork === network)
      .map(a => a.TargetCurrency);
  }

  private _reduceSingleSwap(list: SwapPair[]): ReduceMapFn<SwapPair> {
    return (acc, curr) => {
      const { SourceCurrency: s, TargetCurrency: t } = curr;
      if (acc.has(s)) {
        acc.set(s, [...acc.get(s), t]);
      } else {
        acc.set(s, [t]);
      }

      return acc;
    };
  }

  private _reducer(list: SwapPair[]) {
    switch (this.type) {
      case SwapListModalType.SINGLE:
      default:
        return this._reduceSingleSwap(list);
    }
  }

  private _createList(list: SwapPair[]): Map<string, string[]> {
    const reducer = this._reducer(list);
    return list.reduce(reducer, new Map<string, string[]>());
  }
}
