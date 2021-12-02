import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { MasterSeed } from '../interface/data';
import { AuthenticationProvider } from '../providers/data/authentication.provider';
import { WalletsProvider } from '../providers/data/wallets.provider';
import { MasterSeedService } from '../services/master-seed.service';

@Injectable()
export class AccountMasterSeedResolver implements Resolve<MasterSeed> {
  constructor(
    private authProvider: AuthenticationProvider,
    private msed: MasterSeedService,
    private wallets: WalletsProvider,
  ) {}

  async resolve(): Promise<MasterSeed> {
    const { uid } = this.authProvider.accountValue;
    const custom = this.wallets.customMasterSeedValue; // custom seed is null by default
    const dbMsed = await this.msed.getMasterSeed(); // saved master seed in a database
    const msed: MasterSeed = {
      uid,
      sed: dbMsed?.sed ?? custom,
      bck: dbMsed?.bck ?? !!custom,
    }; // default master seed struct

    if (!msed.sed) {
      msed.sed = this.msed.create();
    }

    if (!dbMsed) await this.msed.addMasterSeed(msed);

    return this.wallets.pushMasterSeed(msed);
  }
}
