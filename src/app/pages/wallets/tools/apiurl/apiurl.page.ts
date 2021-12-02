import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { UtilsService } from 'src/app/services/utils.service';
import { ExplorerService } from 'src/app/services/explorer.service';
import { Wallet } from 'src/app/interface/data';
import { WalletService } from 'src/app/services/wallet.service';
import { Translate } from 'src/app/providers/translate/';

@Component({
  selector: 'app-apiurl',
  templateUrl: './apiurl.page.html',
  styleUrls: ['./apiurl.page.scss'],
})
export class ApiurlPage implements OnInit {
  api: string;
  initialApi: string;
  apiChanged: boolean;
  wallet = this.router.getCurrentNavigation().extras.state?.wallet as Wallet;

  constructor(
    private router: Router,
    private walletService: WalletService,
    private explorerService: ExplorerService,
    private utilsService: UtilsService,
    public $: Translate,
  ) {}

  ngOnInit() {
    this.api = this.initialApi = [
      ...this.explorerService.networks[this.wallet.ticker.toLocaleLowerCase()],
    ].pop().api;
  }

  back(wallet: Wallet) {
    this.router.navigate(['/home', 'wallets', wallet.name, 'overview', 'tools'], {
      state: { wallet },
    });
  }

  apiChangeAction() {
    this.apiChanged = this.api !== this.initialApi;
  }

  resetApi() {
    this.api = [...this.explorerService.networks[this.wallet.ticker.toLocaleLowerCase()]].pop().api;
  }

  showInfo() {
    this.utilsService.presentAlert({ message: this.$.CHANGE_URL_OF_API_COIN_EXPLORER });
  }
}
