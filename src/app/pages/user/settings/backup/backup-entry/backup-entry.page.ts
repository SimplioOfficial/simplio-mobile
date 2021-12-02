import { Component } from '@angular/core';
import { Translate } from 'src/app/providers/translate/';
import { WalletsProvider } from 'src/app/providers/data/wallets.provider';
import { filter, map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'backup-entry-page',
  templateUrl: './backup-entry.page.html',
  styleUrls: ['./backup-entry.page.scss'],
})
export class BackupEntryPage {
  private url = this.router.getCurrentNavigation().extras.state?.url || '/home';

  opened: number;

  msed$ = this.walletsProvider.masterSeed$.pipe(
    filter(msed => !!msed),
    map(msed => msed.sed),
  );
  msedWords$ = this.msed$.pipe(map(msed => msed.split(' ')));

  constructor(
    private router: Router,
    private walletsProvider: WalletsProvider,
    public $: Translate,
  ) {}

  onSubmit() {
    this.router.navigate(['/home', 'user', 'settings', 'backup', 'intro'], {
      state: { url: this.url },
    });
  }

  open(index: number) {
    this.opened = index;
  }

  isOpen(index: number): boolean {
    if (typeof this.opened !== 'number') return false;
    else return index === this.opened;
  }
}
