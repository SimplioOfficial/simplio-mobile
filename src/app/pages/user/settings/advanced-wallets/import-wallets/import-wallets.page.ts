import { Component, OnInit } from '@angular/core';
import { Translate } from 'src/app/providers/translate/';

@Component({
  selector: 'app-import-wallets',
  templateUrl: './import-wallets.page.html',
  styleUrls: ['./import-wallets.page.scss'],
})
export class ImportWalletsPage implements OnInit {
  constructor(public $: Translate) {}

  ngOnInit() {}
}
