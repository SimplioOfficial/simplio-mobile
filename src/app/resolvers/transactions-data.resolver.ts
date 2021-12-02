import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { from, of } from 'rxjs';
import { Transaction, TxType } from 'src/app/interface/data';
import { WalletsProvider } from 'src/app/providers/data/wallets.provider';
import { WalletService } from 'src/app/services/wallet.service';

@Injectable({
  providedIn: 'root',
})
export class TransactionsDataResolver implements Resolve<any> {
  private _wallet = this.walletsProvider.walletValue;

  constructor(private walletsProvider: WalletsProvider, private wallets: WalletService) {}

  resolve() {
    this._wallet = this.walletsProvider.walletValue;
    // const txs = this._cache?.txs ?? [];
    // return [
    //   {
    //   _uuid: '34567898765434567890987656789',
    //   type: TxType.RECEIVE,
    //   ticker: 'BTC',
    //   address: 'guhjkdljhbgvfcdxgchvjbknlmjnhbg',
    //   amount: 23456789,
    //   hash: 'fgvhjbknlmjnhbgvfchvjbkn',
    //   unix: 3456789,
    //   date: '23456789',
    //   confirmed: false,
    //   block: 234567890
    //   },
    //   {
    //   _uuid: '34567898765434567890987656789',
    //   type: TxType.RECEIVE,
    //   ticker: 'BTC',
    //   address: 'guhjkdljhbgvfcdxgchvjbknlmjnhbg',
    //   amount: 23456789,
    //   hash: 'fgvhjbknlmjnhbgvfchvjbkn',
    //   unix: 3456789,
    //   date: '23456789',
    //   confirmed: true,
    //   block: 234567890
    //   },
    //   {
    //   _uuid: '34567898765434567890987656789',
    //   type: TxType.RECEIVE,
    //   ticker: 'BTC',
    //   address: 'guhjkdljhbgvfcdxgchvjbknlmjnhbg',
    //   amount: 23456789,
    //   hash: 'fgvhjbknlmjnhbgvfchvjbkn',
    //   unix: 3456789,
    //   date: '23456789',
    //   confirmed: true,
    //   block: 234567890
    //   },
    //   {
    //   _uuid: '34567898765434567890987656789',
    //   type: TxType.RECEIVE,
    //   ticker: 'BTC',
    //   address: 'guhjkdljhbgvfcdxgchvjbknlmjnhbg',
    //   amount: 23456789,
    //   hash: 'fgvhjbknlmjnhbgvfchvjbkn',
    //   unix: 3456789,
    //   date: '23456789',
    //   confirmed: true,
    //   block: 234567890
    //   },
    //   {
    //   _uuid: '34567898765434567890987656789',
    //   type: TxType.RECEIVE,
    //   ticker: 'BTC',
    //   address: 'guhjkdljhbgvfcdxgchvjbknlmjnhbg',
    //   amount: 23456789,
    //   hash: 'fgvhjbknlmjnhbgvfchvjbkn',
    //   unix: 3456789,
    //   date: '23456789',
    //   confirmed: true,
    //   block: 234567890
    //   },
    // ];
    return this._wallet.transactions ?? [];
  }

  private async _getTxs(): Promise<Transaction[]> {
    return (await this.wallets.getTransactionsOf(this._wallet)) ?? [];
  }
}
