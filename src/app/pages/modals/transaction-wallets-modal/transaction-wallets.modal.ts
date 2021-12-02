import { Component, Input, OnInit } from '@angular/core';

import { ModalController } from '@ionic/angular';
import { Rate, Wallet } from 'src/app/interface/data';
import { RateService } from 'src/app/services/apiv2/connection/rate.service';
import { pipeAmount, UtilsService } from 'src/app/services/utils.service';
import { getPrice } from 'src/app/services/wallets/utils';
import { Translate } from '../../../providers/translate';

export type TransactionWalletModalProps = {
  title: string;
  currency: string;
  wallets: Wallet[];
  role?: string;
};

@Component({
  selector: 'transaction-wallets-modal',
  styleUrls: ['./transaction-wallets.modal.scss'],
  templateUrl: './transaction-wallets.modal.html',
})
export class TransactionWalletsModal implements OnInit {
  @Input() title = 'Select wallet';
  @Input() currency = 'usd';
  @Input() wallets: Wallet[] = [];
  @Input() role?: string;

  rates: Rate[];

  constructor(
    private modalCtrl: ModalController,
    private rateService: RateService,
    public utilsService: UtilsService,
    public $: Translate,
  ) {}

  ngOnInit(): void {
    this.rates = this.rateService.rateValue;
  }

  selectWallet(w: Wallet) {
    this.modalCtrl.dismiss(w, this.role);
  }

  onDismissModal(): void {
    this.modalCtrl.dismiss();
  }

  getNative(w: Wallet) {
    return pipeAmount(w.balance, w.ticker, w.type, w.decimal, true);
  }

  getPrice(rates: Rate[], ticker: string, currency: string): number {
    return getPrice(rates, ticker, currency);
  }
}
