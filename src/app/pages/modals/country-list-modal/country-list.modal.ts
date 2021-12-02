import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { BehaviorSubject } from 'rxjs';

import { CountryCode } from '../../../services/country.service';
import { Translate } from 'src/app/providers/translate/';

@Component({
  selector: 'country-list-modal',
  templateUrl: './country-list.modal.html',
  styleUrls: ['./country-list.modal.scss']
})
export class CountryListModal implements OnInit {
  private _list = new BehaviorSubject<CountryCode[]>([]);
  list$ = this._list.asObservable();

  @Input() codes: CountryCode[] = [];

  constructor(private modalCtrl: ModalController, public $: Translate) {}

  ngOnInit() {
    this._list.next(this.codes);
  }

  selectCode(code: CountryCode) {
    this.modalCtrl.dismiss({ ...code });
  }

  onSearchFocus([isFocused, _event]) {
    if (!isFocused) this._list.next(this.codes);
  }
  onSearchContent(e) {
    const v: string = e.target.value.toString().toUpperCase();
    const filtered = this.codes.filter(
      c => c.code.toUpperCase().includes(v) || c.name.toUpperCase().includes(v) || c.englishName.toUpperCase().includes(v)
    );
    this._list.next(filtered);
  }

  closeModal() {
    this.modalCtrl.dismiss(null);
  }
}
