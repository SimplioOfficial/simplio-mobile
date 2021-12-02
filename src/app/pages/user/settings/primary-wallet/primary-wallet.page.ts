import { Component, OnDestroy, OnInit } from '@angular/core';

import { Observable, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { Wallet } from 'src/app/interface/data';
import { SettingsService } from 'src/app/services/settings/settings.service';
import { SettingsProvider } from 'src/app/providers/data/settings.provider';
import { WalletsProvider } from 'src/app/providers/data/wallets.provider';
import { Translate } from 'src/app/providers/translate/';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-primary-wallet',
  templateUrl: './primary-wallet.page.html',
  styleUrls: ['./primary-wallet.page.scss'],
})
export class PrimaryWalletPage implements OnInit, OnDestroy {
  selectedWallet: string = null;

  private subscription = new Subscription();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private settingsService: SettingsService,
    private settingsProvider: SettingsProvider,
    private walletsProvider: WalletsProvider,
    public $: Translate,
  ) {}

  ngOnInit() {
    const settingsSubscription = this.settingsProvider.settings$
      .pipe(filter(s => !!s))
      .subscribe(settings => {
        this.selectedWallet = settings.primaryWallet || '';
      });

    this.subscription.add(settingsSubscription);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  isSelected(w: Wallet): boolean {
    const s = this.selectedWallet;
    return s === w.name;
  }

  /**
   *  Update primary wallet
   *  @todo remove name support. Wallet should be recognized by uuid
   */
  /**
   *
   * @param wallet Should be the name
   */
  updatePrimaryWallet(wallet: Wallet) {
    // if (wallet._uuid && wallet._uuid.length) {
    //   this.settingsService.updateSettings({primaryWallet:wallet._uuid});
    // } else {
    //   this.settingsService.updateSettings({primaryWallet:wallet.name});
    // }
    this.settingsService.updateSettings({ primaryWallet: wallet.name });
  }

  get wallets$(): Observable<Wallet[]> {
    return this.walletsProvider.wallets$;
  }

  back() {
    this.router.navigate(['..'], {
      relativeTo: this.route.parent,
    });
  }
}
