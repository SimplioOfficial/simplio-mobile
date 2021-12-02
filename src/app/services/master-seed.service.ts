import { Injectable } from '@angular/core';
import { MasterSeed } from 'src/app/interface/data';
import { IoService } from './io.service';
import { AuthenticationProvider } from 'src/app/providers/data/authentication.provider';
import { generateMnemonic, validateMnemonic } from 'bip39';
import { validateSeeds } from './utils.service';

@Injectable({
  providedIn: 'root',
})
export class MasterSeedService {
  constructor(private io: IoService, private authProvider: AuthenticationProvider) {}

  createWallet(mnemo: string) {
    let mnemonic;
    if (mnemo !== '' && !!mnemo) mnemonic = mnemo;
    else mnemonic = generateMnemonic(256);
    if (validateMnemonic(mnemonic)) {
      return mnemonic;
    } else {
      return null;
    }
  }

  create(mnemo?: string): string {
    return this.createWallet(mnemo || '');
  }

  addMasterSeed(msed: MasterSeed): Promise<MasterSeed> {
    const { idt } = this.authProvider.accountValue;
    return this.io.addMasterSeed(msed, idt);
  }

  getMasterSeed(): Promise<MasterSeed> {
    const { uid, idt } = this.authProvider.accountValue;
    return this.io.getMasterSeed(uid, idt);
  }

  validate(msed: MasterSeed): boolean {
    return validateSeeds(msed.sed);
  }

  backup(msed: MasterSeed): Promise<MasterSeed> {
    msed.bck = true;
    const { idt } = this.authProvider.accountValue;
    return this.io.updateMasterSeed(msed, idt);
  }

  importMasterSeed(msed: MasterSeed): Promise<MasterSeed> {
    const { idt, uid } = this.authProvider.accountValue;

    return Promise.all([this.io.updateMasterSeed(msed, idt), this.io.removeWalletsOf(uid)])
      .then(() => msed)
      .catch();
  }
}
