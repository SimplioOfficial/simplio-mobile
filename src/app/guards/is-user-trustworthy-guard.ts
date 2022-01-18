import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { AuthenticationProvider } from 'src/app/providers/data/authentication.provider';
import { KycService } from '../services/kyc.service';
import { UtilsService } from '../services/utils.service';

@Injectable({
  providedIn: 'root',
})
export class IsUserTrustworthyGuard implements CanActivate {
  constructor(
    private router: Router,
    private utils: UtilsService,
    private kycService: KycService,
    private loadingController: LoadingController,
    private authProvider: AuthenticationProvider,
  ) {}

  async canActivate(): Promise<boolean> {
    this.router.navigate(['/home', 'user', 'account', 'lock']);
    return;

    const loading = await this.loadingController.create();
    loading.present();
    await this.kycService
      .getVerificationsRecords()
      .catch(_ => {
        this.utils.showToast('An error occurred, please try it later', 2000, 'warning');
        this.loadingController.dismiss();

        this.router.navigate(['/home', 'user', 'account', 'lock']);
        return false;
      })
      .then(res => {
        console.log(33, res);
        if (!res) {
          this.router.navigate(['/home', 'user', 'account', 'lock']);
          return false;
        }
      });
    loading.dismiss();

    const [isVerified, status] = this.authProvider.isVerifiedValue;
    if (isVerified) return true;

    const detail = this.authProvider.latestVerificationRecord?.detail;
    if (!!detail && detail.reviewAnswer === 'RED' && detail.reviewRejectType === 'FINAL') {
      this.router.navigate(['/home', 'user', 'account', 'lock-final']);
    } else {
      this.router.navigate(['/home', 'user', 'account', 'lock']);
    }

    return false;
  }
}
