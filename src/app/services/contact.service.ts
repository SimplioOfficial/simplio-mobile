import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { Contacts } from './../interface/data';
import { IoService } from './io.service';

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  data: Contacts;
  contactData = new BehaviorSubject<Contacts>(null);

  constructor(private ioService: IoService) {}

  checkContact(ticker, name): boolean {
    if (!this.data[ticker]) {
      return true;
    }
    return this.data[ticker].findIndex(e => e.name === name) === -1;
  }

  clearData() {
    this.contactData.next(null);
  }

  getContact(ticker) {
    return this.data[ticker];
  }

  // push new contact pair to coin
  insertContact(ticker, data) {
    if (!this.data[ticker]) {
      this.data[ticker] = [];
    }
    this.data[ticker].push(data);
    this.save();
    console.log('Inserted contact', data);
  }

  removeContact(ticker, name): boolean {
    if (!this.data[ticker]) {
      return false;
    }
    const index = this.data[ticker].findIndex(e => e.name === name);
    this.data[ticker].splice(index, 1);
    this.save();
  }

  save() {
    this.contactData.next(this.data);
    // this.ioService.saveContact(this.data);
  }
}
