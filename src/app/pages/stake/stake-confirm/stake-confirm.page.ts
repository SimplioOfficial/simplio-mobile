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
  selector: 'stake-confirm-page',
  templateUrl: './stake-confirm.page.html',
  styleUrls: ['./stake-confirm.page.scss'],
})
export class StakeConfirmPage implements OnInit, OnDestroy {
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

  /**
   * @todo saving the pending transaction is obsolete and it was removed why it is here?
   */
  onDone() {
    const data = {
      email: this.authProvider.accountValue.email,
      swapTx: this.swapTx,
    };

    this.singleSwap
      .savePendingSwap(data)
      .then(() => this.router.navigate(['home', 'swap']))
      .catch(async (err: Error) => {
        console.error(err.message);
        await this.utilService.showToast(this.$.SAVING_SWAP_HAS_FAILED, 1500, 'warning');
        this.router.navigate(['home', 'swap']);
      });
  }
}
