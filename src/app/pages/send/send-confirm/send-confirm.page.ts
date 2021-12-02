import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Translate } from 'src/app/providers/translate/';
import { DataService } from 'src/app/services/data.service';
import { SettingsProvider } from '../../../providers/data/settings.provider';
import { SignedTransaction, UnsignedTransaction } from '../../../interface/data';
import { WalletsProvider } from 'src/app/providers/data/wallets.provider';

@Component({
  selector: 'app-send-confirm',
  templateUrl: './send-confirm.page.html',
  styleUrls: ['./send-confirm.page.scss'],
})
export class SendConfirmPage implements OnInit {
  private _originUrl = this.router.getCurrentNavigation().extras.state?.origin || '/home/wallets';
  private wallet = this.router.getCurrentNavigation().extras.state?.wallet;
  sendData: UnsignedTransaction<SignedTransaction>;
  locale = this.settingsProvider.locale;
  currency = this.settingsProvider.currency;

  constructor(
    private router: Router,
    private dataService: DataService,
    private settingsProvider: SettingsProvider,
    private walletsProvider: WalletsProvider,
    public $: Translate,
  ) {}

  ngOnInit() {
    this.sendData = this.dataService.unsignedTransaction;
  }

  next() {
    this.dataService.cleanTransaction();
    this.walletsProvider.pushWallet(this.wallet);
    this.router.navigateByUrl(this._originUrl);
  }
}
