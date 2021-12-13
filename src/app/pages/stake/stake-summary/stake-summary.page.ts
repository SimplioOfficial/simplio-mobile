import { Component, OnInit } from '@angular/core';
import { getAPY, isToken, parseError, tokenId, UtilsService } from 'src/app/services/utils.service';
import { Translate } from 'src/app/providers/translate';
import { IoService } from 'src/app/services/io.service';
import { BackendService } from 'src/app/services/apiv2/blockchain/backend.service';
import { ActivatedRoute, Router } from '@angular/router';
import { StakeTransactionData } from 'src/app/providers/transactions/stake-transaction-data';
import { AuthenticationProvider } from 'src/app/providers/data/authentication.provider';
import { LoadingController } from '@ionic/angular';
import { NetworkService } from 'src/app/services/apiv2/connection/network.service';
import { environment } from 'src/environments/environment';
import { Pool } from '@simplio/backend/interface/stake';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'stake-summary-page',
  templateUrl: './stake-summary.page.html',
  styleUrls: ['./stake-summary.page.scss'],
})
export class StakeSummaryPage implements OnInit {

  private _stakeData = this.router.getCurrentNavigation().extras.state?.stakeData as StakeTransactionData;
  private _pool: Pool = null;

  private _apy = new BehaviorSubject<number>(null);
  apy$ = this._apy.asObservable();

  get amount(): number {
    return this._stakeData.value().amount;
  }

  get wallet() {
    return this._stakeData.wallet;
  }

  get isToken(): boolean {
    const type = this._stakeData?.wallet?.type ?? '';
    if (!type) return false;
    return isToken(type);
  }

  get tokenId(): string {
    const type = this._stakeData?.wallet?.type ?? '';
    if (!type) return '';
    return tokenId(type)
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private io: IoService,
    private utilsService: UtilsService,
    private backendService: BackendService,
    private authProvider: AuthenticationProvider,
    private loadingCtrl: LoadingController,
    private networkService: NetworkService,
    public $: Translate,
  ) { }

  ngOnInit(): void {
    this._getPoolsInfo()
      .then(pools => pools.find(p => p.mintAddress === this._stakeData.value().contractAddr))
      .then(pool => getAPY(pool))
      .then(apy => this._apy.next(apy));
  }

  private async _getPoolsInfo(): Promise<Pool[]> {
    const data: any = await this.networkService.get(environment.POOLS_INFO + "poolsinfo");
    return JSON.parse(this.io.decrypt(data.result, environment.DATA_PASSWORD));
  }

  async onSubmit() {
    const { idt } = this.authProvider.accountValue;
    const seeds = this.io.decrypt(this._stakeData.wallet.mnemo, idt);
    
    const loading = await this.loadingCtrl.create({ 
      message: this.$.instant(this.$.INITIALIZING_STAKE),
      duration: 25000,
    });

    try {
      await loading.present();

      const { amount, contractAddr, poolAddr, decimal, programId, api } = this._stakeData.value();
      await this.backendService.stake.initStake(
        seeds, 
        contractAddr,
        poolAddr,
        amount, 
        decimal,
        programId,
        api,
      );

      await this.router.navigate(['../confirm'], { relativeTo: this.route.parent });
      
    } catch (err) {
      await this.utilsService.showToast(parseError(err.message), 3000, 'warning');
    } finally {
      await loading.dismiss();
    }

  }

  back() {
    this.router.navigate(['../'], { relativeTo: this.route.parent });
  }

}
