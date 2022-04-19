import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { SignedTransaction } from 'src/app/interface/data';
import { Subscription } from 'rxjs';
import { Translate } from 'src/app/providers/translate/';
import { SwapTransaction } from 'src/app/interface/swap';
import { SingleSwapService } from 'src/app/services/swap/single-swap.service';

@Component({
  selector: 'app-swap-confirm',
  templateUrl: './swap-confirm.page.html',
  styleUrls: ['./swap-confirm.page.scss'],
})
export class SwapConfirmPage implements OnInit, OnDestroy {
  swapTxSubsctiption: Subscription;
  swapTx: SwapTransaction<SignedTransaction> = null;

  constructor(
    private router: Router,
    private singleSwap: SingleSwapService,
    private dataService: DataService,
    public $: Translate,
  ) {}

  get sourceCoin(): string {
    return this.swapTx ? this.swapTx.source?.wallet?.ticker : '';
  }

  get sourceNetwork(): string {
    return this.swapTx ? this.swapTx.pair?.SourceCurrencyNetwork : '';
  }

  get targetCoin(): string {
    return this.swapTx ? this.swapTx.target?.wallet?.ticker : '';
  }

  get targetNetwork(): string {
    return this.swapTx ? this.swapTx.pair?.TargetCurrencyNetwork : '';
  }

  ngOnInit() {
    this.swapTxSubsctiption = this.dataService.swapTransaction.subscribe(swap => {
      this.swapTx = swap;
    });
  }

  ngOnDestroy() {
    this.swapTxSubsctiption.unsubscribe();
    this.dataService.cleanSwapTransaction();
  }

  async onDone() {
    await this.router.navigate(['home', 'swap']);
  }
}
