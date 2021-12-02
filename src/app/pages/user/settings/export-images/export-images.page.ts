import { Component, OnInit } from '@angular/core';

import { Subscription } from 'rxjs';

import { Data } from 'src/app/interface/data';
import { WalletService } from 'src/app/services/wallet.service';
import { AesService } from 'src/app/services/aes.service';
import { AuthenticationProvider } from 'src/app/providers/data/authentication.provider';
import { Router, ActivatedRoute } from '@angular/router';

export interface QrData {
  data: string;
  name: string;
}

@Component({
  selector: 'app-export-images',
  templateUrl: './export-images.page.html',
  styleUrls: ['./export-images.page.scss'],
})
export class ExportImagesPage implements OnInit {
  wallet: Data;
  qrData: QrData[] = [];
  walletSubscription: Subscription;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private walletService: WalletService,
    private aesService: AesService,
    private authProvider: AuthenticationProvider,
  ) {}

  ngOnInit() {
    this.walletSubscription = this.walletService.walletData.subscribe(data => {
      if (data) {
        const { idt } = this.authProvider.accountValue;
        data.wallets.forEach(element => {
          this.qrData.push({
            data: JSON.stringify({
              mnemo: this.aesService.decryptString(element.mnemo, idt),
              name: element.name,
            }),
            name: element.name,
          });
        });
      }
    });
  }

  back() {
    this.router.navigate(['..'], {
      relativeTo: this.route.parent,
    });
  }
}
