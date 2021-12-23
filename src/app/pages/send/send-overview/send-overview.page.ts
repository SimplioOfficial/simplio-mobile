import { Component, OnInit } from '@angular/core';

import { SignedTransaction, UnsignedTransaction, Wallet, WalletType } from 'src/app/interface/data';
import { ActivatedRoute, Router } from '@angular/router';
import { Translate } from 'src/app/providers/translate/';
import { DataService } from 'src/app/services/data.service';
import { TransactionsService } from 'src/app/services/transactions.service';
import { pipeAmount, UtilsService } from 'src/app/services/utils.service';
import { MultiFactorAuthenticationService } from 'src/app/services/authentication/mfa.service';
import { CheckWalletsService } from 'src/app/services/wallets/check-wallets.service';
import { RateService } from 'src/app/services/apiv2/connection/rate.service';
import { IoService } from 'src/app/services/io.service';
import { SettingsProvider } from 'src/app/providers/data/settings.provider';
import { BackendService } from 'src/app/services/apiv2/blockchain/backend.service';

@Component({
  selector: 'app-send-overview',
  templateUrl: './send-overview.page.html',
  styleUrls: ['./send-overview.page.scss'],
})
export class SendOverviewPage implements OnInit {
  sendData: UnsignedTransaction<SignedTransaction>;
  disabledBroadcast = false;
  amountSat = 0;
  fiatSat = 0;
  currency = this.settingsProvider.currency;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private settingsProvider: SettingsProvider,
    private dataService: DataService,
    private utils: UtilsService,
    private mfa: MultiFactorAuthenticationService,
    private rateService: RateService,
    private checker: CheckWalletsService,
    private io: IoService,
    public $: Translate,
    private backendService: BackendService,
  ) {}

  ngOnInit() {
    this.sendData = this.dataService.unsignedTransaction;
    this.amountSat = UtilsService.isPolkadot(this.sendData.wallet.type)
      ? pipeAmount(
          this.sendData.signature.amount,
          this.sendData.wallet.ticker,
          this.sendData.wallet.type,
          this.sendData.wallet.decimal,
        )
      : this.sendData.signature.amount;
    this.fiatSat = UtilsService.isPolkadot(this.sendData.wallet.type)
      ? pipeAmount(
          this.sendData.signature.amount,
          this.sendData.wallet.ticker,
          this.sendData.wallet.type,
          this.sendData.wallet.decimal,
        ) * this.sendData.fiat.rate
      : this.sendData.fiat.amount;
    if (UtilsService.isPolkadot(this.sendData.wallet.type)) {
      // this.feeService.estimatedFee(this.sendData.mnemo, this.sendData.address, this.sendData.amount).then(res => {
      //   this.sendData.signature.fee = res;
      // });
    }
  }

  async onSubmit() {
    const modal = await this.mfa.showIdentityVerificationModal({
      fullScreen: true,
      attempts: 3,
      warnAt: 2,
    });

    const {
      data: {
        result: [isVerified],
      },
    } = await modal.onWillDismiss();

    if (isVerified) return this.broadcast();

    this.utils.showToast(this.$.INCORRECT_PIN, 3000, 'warning');
  }

  check = (w: Wallet) => {
    this.checker.checkTransactions(
      {
        wallets: [w],
      },
      () => {
        this.rateService.refresh(false);
      },
    );
  };

  broadcast() {
    this.disabledBroadcast = true;
    this.backendService
      .createTransaction({
        _uuid: this.sendData.wallet._uuid,
        seeds: this.sendData.mnemo,
        explorer: this.sendData.explorer,
        addresses: this.sendData.wallet.addresses,
        ticker: this.sendData.wallet.ticker,
        receiver: this.sendData.address,
        type: this.sendData.wallet.type,
        amount: this.sendData.signature.amount,
        fee: this.sendData.signature.fee,
        utxos: this.sendData.signature.utxo,
        change: this.sendData.signature.change,
        gasLimit: this.sendData.signature.gasLimit,
        gasPrice: this.sendData.signature.gasPrice,
        balance: this.sendData.wallet.balance,
        abi: this.io.getAbi(this.sendData.wallet.contractaddress, this.sendData.wallet.type),
        contractAddress: this.sendData.wallet.contractaddress,
        lasttx: this.sendData.wallet.lasttx,
        api: this.sendData.wallet.api,
        feeContractAddress: 'BVe7rDXoCm6UhWh1P5mTnVZAnov6MFxGzykqNmhLB7HH',
        addressType: this.sendData.wallet.addressType
      })
      .then(res => {
        this.check(this.sendData.wallet);
        this.router.navigate(['home', 'wallets', 'send', 'sendconfirm']);
      })
      .catch(err => {
        this.disabledBroadcast = false;
        console.log(err);
        this.utils.showToast(err.error ? err.error : err.message, 3000, 'warning');
      });
  }

  back() {
    this.router.navigate(['..'], {
      relativeTo: this.route.parent,
      state: {
        wallet: this.sendData.wallet,
      },
    });
  }
}
