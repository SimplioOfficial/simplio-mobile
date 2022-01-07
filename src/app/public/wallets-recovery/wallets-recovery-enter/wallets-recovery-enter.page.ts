import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';
import { map, skipWhile, tap } from 'rxjs/operators';
import { InsertSeedModal } from 'src/app/pages/modals/insert-seed-modal/insert-seed.modal';
import { WalletsProvider } from 'src/app/providers/data/wallets.provider';
import { Translate } from 'src/app/providers/translate/';
import { UtilsService, validateSeeds } from 'src/app/services/utils.service';
import { WalletService } from 'src/app/services/wallet.service';
import { AuthenticationProvider } from 'src/app/providers/data/authentication.provider';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'wallets-recovery-page',
  templateUrl: './wallets-recovery-enter.page.html',
  styleUrls: ['./wallets-recovery-enter.page.scss'],
})
export class WalletsRecoveryEnterPage implements OnDestroy {
  private _loading = new BehaviorSubject(false);
  private LENGTH = 24;
  private wrongSeed = false;
  private EMPTY_SEED = Array.from(Array(this.LENGTH), () => '');
  private _seed$ = new BehaviorSubject<string[]>(Array.from(this.EMPTY_SEED));
  private _apply$;

  loading$ = this._loading.asObservable();

  static formatWord(word: string): string {
    return word.toLowerCase().trim();
  }

  /* tslint:disable:semicolon */
  _seedCheck = () =>
    this._seed$
      .pipe(
        skipWhile(s => s.includes('')),
        map(msedArr => msedArr.join(' ')),
        tap(msed => {
          msed = msed.toLowerCase();
          const isValid = validateSeeds(msed);
          if (isValid) {
            this.walletsProvider.pushCustomMasterSeed(msed);
            this.authProvider.pushCanRecover(false);
            this._loading.next(true);
            this.router.navigate(['/home']);
          } else {
            this.wrongSeed = true;
            this.utils.showToast(this.$.SEED_INCORRECT, 2600, 'warning');
            this.authProvider.pushCanRecover(true);
          }
        }),
      )
      .subscribe();
  /* tslint:enable:semicolon */
  get seedValue(): string[] {
    return this._seed$.value;
  }

  get seedText(): string {
    return this._seed$.value.join(' ');
  }

  constructor(
    private router: Router,
    private modalCtr: ModalController,
    private walletsProvider: WalletsProvider,
    private walletService: WalletService,
    private utils: UtilsService,
    private authProvider: AuthenticationProvider,
    public $: Translate,
  ) {
    this._apply$ = this._seedCheck();
  }

  ngOnDestroy() {
    this._apply$.unsubscribe();
  }

  private _pushSeedValue(index: number, word: string): string[] {
    const org = this._seed$.value;
    org[index] = WalletsRecoveryEnterPage.formatWord(word);
    this._seed$.next(org);
    return org;
  }

  applyWord(index: number, word: string) {
    this._pushSeedValue(index, word);
  }

  async openModal(index: number, word: string) {
    const modal = await this.modalCtr.create({
      component: InsertSeedModal,
      componentProps: { index, word, value: word },
    });

    await modal.present();
    const {
      data: { value, modified },
    } = await modal.onWillDismiss();
    if (!modified) return;

    const splt = value.split(' ');
    splt.forEach((word, i) => this._pushSeedValue(index + i, word));

    const nextIndex = index + splt.length;
    if (nextIndex < this.LENGTH) {
      this.openModal(nextIndex, null);
    }
  }

  isFilled(word: string): boolean {
    return typeof word === 'string' && word.length > 0;
  }

  back() {
    this.router.navigate(['recovery', 'intro']);
  }
}
