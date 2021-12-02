import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { Translate } from 'src/app/providers/translate';
import { environment } from '../../../../../environments/environment';
import { SettingsProvider } from '../../../../providers/data/settings.provider';
import { SwipeluxProvider } from '../../../../providers/swipelux/swipelux-provider.service';
import { AccountService } from '../../../../services/authentication/account.service';
import { TrackedPage } from '../../../../classes/trackedPage';
import { KycService } from '../../../../services/kyc.service';
import { SwipeluxService } from '../../../../services/swipelux/swipelux.service';

declare const SNSMobileSDK: import('@sumsub/cordova-idensic-mobile-sdk-plugin/dist/SNSMobileSDK');

enum SumSubResponseStatusType {
  Unknown = 'Unknown',
  Initial = 'Initial',
  Incomplete = 'Incomplete',
  Pending = 'Pending',
  TemporarilyDeclined = 'TemporarilyDeclined',
  Approved = 'Approved',
}

@Component({
  selector: 'kyc-sum-sub',
  templateUrl: './kyc-sum-sub.page.html',
  styleUrls: ['./kyc-sum-sub.page.scss'],
})
export class KycSumSubPage extends TrackedPage implements OnInit, OnDestroy {
  sumsubResponseStatus = SumSubResponseStatusType.Unknown;
  SumSubResponseStatusType = SumSubResponseStatusType;

  private token: string;
  private language = 'en';
  private subscription = new Subscription();

  private readonly sumSubApiUrl = environment.SUM_SUB_API_URL;
  private readonly supportEmail = 'apps@simplio.io';

  constructor(
    private router: Router,
    private acc: AccountService,
    private kycService: KycService,
    private swipeluxService: SwipeluxService,
    private swipeluxProvider: SwipeluxProvider,
    private settingsProvider: SettingsProvider,
    public $: Translate,
  ) {
    super();
    this.subscription.add(
      this.settingsProvider.language$.subscribe(lan => (lan ? (this.language = lan) : 'en')),
    );
  }

  async ngOnInit() {
    // this.kycService.getSumSubApplicant().then(res => console.log(58, res));
    // this.kycService.getVerificationsRecords().then(res => console.log(59, res));
    // this.kycService.getSumSubToken().then(async res => {
    //   this.token = res.token;

    // this.token = this.swipeluxProvider.sumsubToken;
    // this.token = (await this.kycService.getSumSubToken()).token;
    this.token = '_act-00a3f978-7add-436b-86fa-f0b81396d205';
    const snsMobileSDK = SNSMobileSDK.Builder(this.sumSubApiUrl, 'basic-kyc-level') // 'msdk-basic-kyc'
      .withAccessToken(this.token, () => {
        // this is a token expiration handler, will be called if the provided token is invalid or got expired
        // return new Promise(resolve => resolve(this.token));
        return new Promise(
          resolve => resolve(this.token),
          // resolve(async () => {
          //   this.token = (await this.kycService.getSumSubToken()).token;
          // }),
        ).catch(e => console.error(e));
      })
      .withHandlers({
        // Optional callbacks you can use to get notified of the corresponding events
        onStatusChanged: event => {
          console.log('onStatusChanged: [' + event.prevStatus + '] => [' + event.newStatus + ']');
        },
        // Prepared callbacks:
        onStatusDidChange: () => null,
        onDidDismiss: () => null,
      })
      .withDebug(!environment.production)
      .withSupportEmail(this.supportEmail)
      .withLocale(this.language) // Optional, for cases when you need to override system locale
      .build();

    snsMobileSDK
      .launch()
      .then(async ({ status }) => this.handleSumSubResult(status, this.token))
      .catch(err => {
        console.log('SumSub SDK Error: ' + JSON.stringify(err));
        this.sumsubResponseStatus = SumSubResponseStatusType.TemporarilyDeclined;
      });
    // });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private async handleSumSubResult(status: SumSubResponseStatusType, token: string) {
    this.sumsubResponseStatus = status;
    console.log('SumSub SDK status: ' + status);

    await this.router.navigate(['home', 'wallets']);
  }
}
