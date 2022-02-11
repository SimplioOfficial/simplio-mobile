import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { Translate } from 'src/app/providers/translate';
import { OrderResponse } from '../../../interface/swipelux';
import { SwipeluxService } from '../../../services/swipelux/swipelux.service';
import { UtilsService } from '../../../services/utils.service';

@Component({
  selector: 'purchase-summary-page',
  templateUrl: './purchase-summary.page.html',
  styleUrls: ['./purchase-summary.page.scss'],
})
export class PurchaseSummaryPage {
  order = this.router.getCurrentNavigation().extras.state.order as OrderResponse;

  constructor(
    private router: Router,
    private utils: UtilsService,
    private route: ActivatedRoute,
    private loadingCtrl: LoadingController,
    private swipeluxService: SwipeluxService,
    public $: Translate,
  ) {}

  back() {
    this.router.navigate(['../initial'], {
      relativeTo: this.route.parent,
    });
  }

  async onSubmit() {
    const loading = await this.loadingCtrl.create();
    loading.present();

    try {
      const paymentData = await this.swipeluxService.initializePayment();
      await this.router.navigate(['../gateway-iframe'], {
        relativeTo: this.route.parent,
        state: {
          iframeUrl: paymentData.paymentUrl,
        },
      });
    } catch {
      this.utils.showToast('An error occurred, please try it later', 2000, 'warning');
      loading.dismiss();
    }
  }
}
