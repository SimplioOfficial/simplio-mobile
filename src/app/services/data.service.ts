import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import { SignedTransaction, UnsignedTransaction, Wallet, WalletType } from '../interface/data';
import { SwapTransaction } from '../interface/swap';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  refreshCounter = new BehaviorSubject<number>(null);
  sendData: any = {};
  overviewWallet: Wallet | null = null;
  unsignedTransaction: UnsignedTransaction<SignedTransaction> | null = null;
  receiveData: any = {};
  email: string;
  swapTransaction: BehaviorSubject<SwapTransaction<SignedTransaction>> = new BehaviorSubject(null);

  constructor(private http: HttpClient) {}

  cleanSwapTransaction() {
    this.swapTransaction.next(null);
  }

  cleanTransaction() {
    this.unsignedTransaction = null;
  }

  // @todo is this commented code really needed?
  finalizeTransaction(signedTransaction: SignedTransaction): SignedTransaction {
    // this.unsignedTransaction.fee.feeText = this.unsignedTransaction.fee.name + ' (' + res.feePercent + '%)'
    // try {
    //   if (res.fee + res.amount > sendData.wallet.balance) {
    //     this.disableSend = true;
    //     this.errorToast("Not enough coin to send, please lower amount or fee", 4000);
    //     return;
    //   }
    //   else {
    //     console.log(res.rawtx);
    //   }
    // }
    // catch (e) {
    //   //show error notice
    //   this.disableSend = true;
    //   this.errorToast(e.message.split(':')[0], 'warning');
    //   return;
    // }
    // this.dataService.sendData.rawtx = res.rawtx;
    // this.dataService.sendData.amountSatoshi = res.amount;
    // this.dataService.sendData.amount = Number((res.amount / 1e8).toFixed(8));
    // this.dataService.sendData.feeSatoshi = res.fee;
    // this.dataService.sendData.fee = Number((res.fee / 1e8).toFixed(8));
    // this.dataService.sendData.feePercent = Number((res.fee * 100 / res.fee).toFixed(2));
    // this.dataService.sendData.feeText = res.fee + ' (' + res.feePercent + '%)';
    // this.disableSend = false;
    return signedTransaction;
  }

  initTransaction() {
    this.unsignedTransaction = {
      wallet: null,
      privKey: '',
      amount: 0,
      address: '',
      fiat: {
        type: '',
        rate: 0,
        amount: 0,
      },
      feepipe: {
        ticker: '',
        type: 0,
        decimal: 0,
      },
      fee: {
        name: '',
        price: 0,
        value: 0,
        minFee: 0,
        ticker: '',
        type: WalletType.UNKNOWN,
      },
      isMax: false,
      utxo: [],
      ready: false,
    };
  }

  setSwapTransaction(swapTransaction: any /* SwapTransaction<SignedTransaction>*/) {
    this.swapTransaction.next(swapTransaction);
  }
}
