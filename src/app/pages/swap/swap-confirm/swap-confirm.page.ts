import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { SignedTransaction } from 'src/app/interface/data';
import { Subscription } from 'rxjs';
import { UtilsService } from 'src/app/services/utils.service';
import { Translate } from 'src/app/providers/translate/';
import { AuthenticationProvider } from 'src/app/providers/data/authentication.provider';
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
    private utilService: UtilsService,
    private authProvider: AuthenticationProvider,
    public $: Translate,
  ) {}

  get sourceCoin(): string {
    return this.swapTx ? this.swapTx?.source?.wallet?.ticker : '';
  }

  get targetCoin(): string {
    return this.swapTx ? this.swapTx?.target?.wallet?.ticker : '';
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
