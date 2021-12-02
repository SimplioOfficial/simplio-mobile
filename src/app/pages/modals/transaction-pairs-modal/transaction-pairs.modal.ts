import { Component, Input, OnInit } from '@angular/core';

import { ModalController } from '@ionic/angular';

import { AddressType, Rate, SwapPair, Wallet, WalletType } from 'src/app/interface/data';
import { UtilsService } from 'src/app/services/utils.service';
import { getPrice } from 'src/app/services/wallets/utils';
import { coins } from '../../../../assets/json/coinlist';
import { Translate } from '../../../providers/translate';
import { RateService } from '../../../services/apiv2/connection/rate.service';
import { CurrencyPair } from '../../../services/swipelux/swipelux.service';

export type TransactionCoinsModalProps = {
  title: string;
  currency: string;
  usdPairs: SwapPair[];
  eurPairs: SwapPair[];
};

@Component({
  selector: 'transaction-pairs-modal',
  styleUrls: ['./transaction-pairs.modal.scss'],
  templateUrl: './transaction-pairs.modal.html',
})
export class TransactionPairsModal implements OnInit {
  @Input() title: string;
  @Input() usdPairs: CurrencyPair[] = [];
  @Input() eurPairs: CurrencyPair[] = [];

  virtualUsdWallets: Wallet[];
  virtualEurWallets: Wallet[];

  rates: Rate[];

  constructor(
    private modalCtrl: ModalController,
    private rateService: RateService,
    public utilsService: UtilsService,
    public $: Translate,
  ) {}

  ngOnInit(): void {
    this.rates = this.rateService.rateValue;

    console.log(
      45,
      this.usdPairs.map(a => a.toCurrency.a3),
      this.eurPairs.map(a => a.toCurrency.a3),
    );
    this.virtualUsdWallets = this.usdPairs.map(p => this.getImaginaryWallet(p));
    this.virtualEurWallets = this.eurPairs.map(p => this.getImaginaryWallet(p));
  }

  getPrice(coin: string, currency: string): number {
    return getPrice(this.rates, coin, currency);
  }

  onDismissModal(): void {
    this.modalCtrl.dismiss(null);
  }

  selectEurPair(w: Wallet) {
    this.modalCtrl.dismiss([...this.eurPairs].find(a => a.toCurrency.a3 === w.ticker));
  }

  selectUsdPair(w: Wallet) {
    this.modalCtrl.dismiss([...this.usdPairs].find(a => a.toCurrency.a3 === w.ticker));
  }

  private getImaginaryWallet(pair: CurrencyPair): Wallet {
    const ticker = pair.toCurrency.a3;
    const type = this.getWalletType(ticker);

    return {
      _p: null,
      _uuid: null,
      uid: null,
      name: this.getWalletName(pair.toCurrency.a3),
      type: this.getWalletType(pair.toCurrency.a3),
      ticker,
      balance: UtilsService.sPipeAmount(
        1,
        pair.toCurrency.a3,
        type,
        UtilsService.getDecimals(type, ticker),
      ),
      unconfirmed: 0,
      mnemo: null,
      mainAddress: null,
      isActive: true,
      isRescanning: false,
      isInitialized: false,
      lastblock: 0,
      lasttx: '',
      uniqueId: 0,
      addresses: null,
      addressType: AddressType.DEFAULT,
    };
  }

  private getWalletName(coin: string): string {
    return coins.find(a => a.ticker.toUpperCase() === coin.toUpperCase()).name;
  }

  private getWalletType(coin: string): WalletType {
    return coins.find(a => a.ticker.toUpperCase() === coin.toUpperCase()).type;
  }
}
