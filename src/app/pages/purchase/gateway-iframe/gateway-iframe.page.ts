import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';

import { Translate } from 'src/app/providers/translate';
import { SwipeluxService } from '../../../services/swipelux/swipelux.service';
import { PaymentStatus } from '../purchase-final/purchase-final.page';

@Component({
  selector: 'gateway-iframe',
  templateUrl: './gateway-iframe.page.html',
  styleUrls: ['./gateway-iframe.page.scss'],
})
export class GatewayIframePage implements OnInit {
  paymentUrl = this.router.getCurrentNavigation().extras.state.iframeUrl;

  paymentSafeUrl: SafeUrl;

  private interval;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private loadingCtrl: LoadingController,
    private swipeluxService: SwipeluxService,
    public $: Translate,
  ) {}

  ngOnInit() {
    console.log(25, this.paymentUrl);
    this.paymentSafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.paymentUrl);

    setTimeout(() => this.loadingCtrl.dismiss(), 3000);

    this.interval = setInterval(
      () =>
        this.swipeluxService.getCurrentOrders().then(res => {
          const status = res.orderPaymentLast.orderPaymentEventLast.status;
          console.log(39, status);
          if (status === 'SUCCESS') {
            clearInterval(this.interval);
            this.router.navigate(['final'], {
              relativeTo: this.route.parent.parent,
              state: {
                status: PaymentStatus.SUCCESS,
              },
            });
          } else if (status === 'ERROR') {
            clearInterval(this.interval);
            this.router.navigate(['final'], {
              relativeTo: this.route.parent.parent,
              state: {
                status: PaymentStatus.ERROR,
              },
            });
          }
        }),
      1000,
    );
  }

  async onSubmit(state: boolean) {}

  close() {
    this.router.navigate(['/home']);
    this.onSubmit(false);
  }
}
