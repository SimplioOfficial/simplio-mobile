import { Component, OnDestroy, ViewChild } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { UtilsService } from 'src/app/services/utils.service';
import { Translate } from 'src/app/providers/translate/';
import { WalletsProvider } from 'src/app/providers/data/wallets.provider';
import { filter, map, skipWhile, tap } from 'rxjs/operators';
import { MasterSeedService } from 'src/app/services/master-seed.service';
import { Router } from '@angular/router';
import { IonSlides } from '@ionic/angular';

@Component({
  selector: 'backup-repeat-page',
  templateUrl: './backup-repeat.page.html',
  styleUrls: ['./backup-repeat.page.scss'],
})
export class BackupRepeatPage implements OnDestroy {
  private readonly url = this.router.getCurrentNavigation().extras.state?.url || '/home';
  private LENGTH = 24;
  seeds: string[] = [];
  @ViewChild('slides') slides: IonSlides;

  private _disabled = false;
  get disabled(): boolean {
    return this._disabled;
  }

  slideOpts = {
    slidesPerView: 'auto',
    centeredSlides: true,
    allowTouchMove: false,
    speed: 600,
  };

  private _final = new BehaviorSubject<string[]>(Array.from(Array(this.LENGTH)).map(() => ''));
  final$ = this._final.asObservable();

  msed$ = this.walletsProvider.masterSeed$.pipe(
    filter(msed => !!msed),
    map(msed => msed.sed),
    map(msed => {
      this.seeds = msed.split(' ');
      return this.seeds;
    }),
  );

  words$ = combineLatest([this.msed$, this._final]).pipe(
    map(([msed, final]) => ({
      msed,
      final,
      check: [...final].map<boolean>(f => !!f).every(v => !!v),
    })),
    tap(({ msed, final, check }) => check && this._check.next([true, msed, final])),
    skipWhile(({ check }) => check),
    map(({ msed, final }) => {
      const index = final.findIndex(f => typeof f === 'string' && !f.length);
      const word = msed[index];
      const salt = this.msed.create().split(' ');
      salt[0] = word;
      return this.shuffle(salt);
    }),
  );

  private _check = new BehaviorSubject<[boolean, string[], string[]]>([false, [], []]);
  checkSub = this._check
    .pipe(
      skipWhile(([c]) => !c),
      tap(([_, words, selected]) => this.compare(words, selected)),
    )
    .subscribe();

  constructor(
    private router: Router,
    private utilsService: UtilsService,
    private msed: MasterSeedService,
    private walletsProvider: WalletsProvider,
    public $: Translate,
  ) {}

  ngOnDestroy() {
    this.checkSub.unsubscribe();
  }

  checkWord(index: number, word) {
    return this.seeds[index] === word;
  }

  async compare(msed: string[], selected: string[]) {
    const a = msed.join(' ');
    const b = selected.join(' ');

    if (a === b) {
      const msed = await this.msed.backup(this.walletsProvider.masterSeedValue);
      this.walletsProvider.pushMasterSeed(msed);

      this.router
        .navigate(['/home', 'user', 'settings', 'backup', 'success'], {
          state: { url: this.url },
        })
        .catch(console.error);
    } else {
      this.utilsService.showToast(this.$.THE_SEED_DOES_NOT_MATCH, 3000, 'warning');
      this.router.navigateByUrl(this.url);
    }
  }

  async selectWord(word: string) {
    if (this._disabled) return;

    this._disabled = true;

    const index = await this.slides.getActiveIndex();

    const v = [...this._final.value];

    if (!this.checkWord(index, word)) {
      this.utilsService.showToast(this.$.THE_SEED_DOES_NOT_MATCH, 3000, 'warning');
      this.enable();
      this._final.next(v);
    } else {
      v[index] = word;
      this._final.next(v);
      setTimeout(async () => {
        await this.slides.slideNext();
      }, 600);
    }
  }

  shuffle(arr: string[]): string[] {
    const clone = Array.from(arr);
    return clone.sort(() => 0.5 - Math.random());
  }

  isFilled(word: string): boolean {
    return typeof word === 'string' && !!word.length;
  }

  enable() {
    this._disabled = false;
  }
}
