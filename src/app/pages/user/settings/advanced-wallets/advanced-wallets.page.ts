import { Component } from '@angular/core';
import { Translate } from 'src/app/providers/translate/';
@Component({
  selector: 'advanced-wallets-page',
  templateUrl: './advanced-wallets.page.html',
  styleUrls: ['./advanced-wallets.page.scss'],
})
export class AdvancedWalletsPage {
  constructor(public $: Translate) {}
}
