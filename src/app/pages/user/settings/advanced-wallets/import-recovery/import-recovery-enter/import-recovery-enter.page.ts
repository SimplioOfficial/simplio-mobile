import { Component, OnDestroy } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';
import { map, skipWhile, tap } from 'rxjs/operators';
import { MasterSeed } from 'src/app/interface/data';
import { InsertSeedModal } from 'src/app/pages/modals/insert-seed-modal/insert-seed.modal';
import { SettingsProvider } from 'src/app/providers/data/settings.provider';
import { WalletsProvider } from 'src/app/providers/data/wallets.provider';
import { Translate } from 'src/app/providers/translate';
import { WalletsRecoveryEnterPage } from 'src/app/public/wallets-recovery/wallets-recovery-enter/wallets-recovery-enter.page';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { MasterSeedService } from 'src/app/services/master-seed.service';
import { ThemeService } from 'src/app/services/settings/theme.service';
import { UtilsService, validateSeeds } from 'src/app/services/utils.service';
import { WalletService } from 'src/app/services/wallet.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'import-recovery-enter-page',
  templateUrl: './import-recovery-enter.page.html',
  styleUrls: ['./import-recovery-enter.page.scss'],
})
export class ImportRecoveryEnterPage implements OnDestroy {
  private _loading = new BehaviorSubject(false);
  private LENGTH = 24;
  private EMPTY_SEED = Array.from(Array(this.LENGTH), () => '');
  private _seed$ = new BehaviorSubject<string[]>(Array.from(this.EMPTY_SEED));
  private _apply$;
  private wrongSeed = false;
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
          if (msed === this.walletsProvider.masterSeedValue.sed) {
            return this.utils.showToast(this.$.SEED_UNIQUE_ERROR, 2600, 'warning');
          }

          const isValid = validateSeeds(msed);
          if (isValid) this._import(msed);
          else {
            this.wrongSeed = true;
            this.utils.showToast(this.$.SEED_INCORRECT, 2600, 'warning');
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
    private modalCtr: ModalController,
    private msed: MasterSeedService,
    private auth: AuthenticationService,
    private theme: ThemeService,
    private walletsProvider: WalletsProvider,
    private walletService: WalletService,
    private utils: UtilsService,
    private settingsProvider: SettingsProvider,
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
    if (!environment.production && (splt.length === 12 || splt.length === 24)) {
      let index = 0;
      splt.forEach(element => {
        this._pushSeedValue(index++, element);
      });
    } else {
      this._pushSeedValue(index, value);
    }
  }

  isFilled(word: string): boolean {
    return typeof word === 'string' && word.length > 0;
  }

  dismiss() {}

  private async _import(sed: string) {
    const modal = await this.modalCtr.create({
      component: InsertSeedModal,
      componentProps: { finished: true },
    });
    await modal.present();
    await modal.onWillDismiss();

    this._loading.next(true);
    try {
      const msed: MasterSeed = {
        ...this.walletsProvider.masterSeedValue,
        sed,
        bck: true,
      };

      await this.msed.importMasterSeed(msed);
      await this.auth.logout();
      this.walletsProvider.clean();
      window.location.reload();
      await this.theme.applyTheme(this.settingsProvider.defaultTheme);
    } catch (err) {
      this.utils.showToast(this.$.IMPORT_RECOVERY_ERROR, 3000, 'warning');
    } finally {
      this._loading.next(false);
    }
  }
}
