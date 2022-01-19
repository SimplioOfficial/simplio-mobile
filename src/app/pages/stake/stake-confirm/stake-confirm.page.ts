import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Translate } from 'src/app/providers/translate/';

@Component({
  selector: 'stake-confirm-page',
  templateUrl: './stake-confirm.page.html',
  styleUrls: ['./stake-confirm.page.scss'],
})
export class StakeConfirmPage implements OnInit, OnDestroy {
  private wallet = this.router.getCurrentNavigation().extras.state?.wallet;
  private amount = this.router.getCurrentNavigation().extras.state?.amount;

  constructor(private router: Router, public $: Translate) {}

  ngOnInit() {}

  ngOnDestroy() {}

  /**
   * @todo saving the pending transaction is obsolete and it was removed why it is here?
   */
  onDone() {
    this.router.navigate(['/home', 'swap'], {
      state: {
        tab: 'staking',
      },
    });
  }
}
