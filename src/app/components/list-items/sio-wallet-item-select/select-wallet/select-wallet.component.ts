import {
  AfterContentInit,
  Component,
  HostBinding,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { Router } from '@angular/router';

import { Wallet } from 'src/app/interface/data';
import { pipeAmount, UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'select-wallet',
  templateUrl: './select-wallet.component.html',
  styleUrls: ['../../generic-item.scss', './select-wallet.component.scss'],
})
export class SelectWalletComponent implements OnInit, AfterContentInit, OnChanges {
  @Input() wallet: Wallet;
  @Input() rate: number;
  @Input() currency = 'usd';
  @Input() locale = 'en';
  @Input() isContent: boolean;
  @Input() errCode: string;
  @Input('thumbnail-scale') thumbScale = 'normal';
  @Input() routerLink?: Array<string> = [];
  @Input() @HostBinding('attr.disabled') disabled = false;

  fiat = 0;

  constructor(private router: Router) {}

  @HostBinding('class.ripple-parent')
  @HostBinding('class.ion-activatable')
  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.wallet) {
      this.updateWallet(changes.wallet.currentValue);
      this.updateFiat(this.rate);
    }
    if (changes.rate) {
      this.updateFiat(changes.rate.currentValue);
    }
  }

  ngAfterContentInit() {
    this.updateFiat(this.rate);
  }

  @HostListener('click', ['$event'])
  onClick() {
    if (!this.routerLink.length) {
      return;
    }
    this.router.navigate(this.routerLink);
  }

  updateFiat(rate) {
    this.fiat =
      pipeAmount(
        this.wallet.balance,
        this.wallet.ticker,
        this.wallet.type,
        this.wallet.decimal,
        true,
      ) * rate;
  }

  updateWallet(wallet: Wallet) {
    this.wallet = wallet;
  }
}
