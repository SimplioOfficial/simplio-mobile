import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Tutorials } from 'src/app/interface/tutorials';
import { TutorialsProvider } from 'src/app/providers/data/tutorials.provider';
import { TutorialsService } from 'src/app/services/tutorials/tutorials.service';
import { AuthenticationProvider } from '../providers/data/authentication.provider';

@Injectable()
export class AccountTutorialsResolver implements Resolve<Tutorials> {
  constructor(
    private authProvider: AuthenticationProvider,
    private tutorialsProvider: TutorialsProvider,
    private tutorials: TutorialsService,
  ) {}

  async resolve(): Promise<Tutorials> {
    const { uid } = this.authProvider.accountValue;

    let tuts = await this.tutorials.get(uid);

    if (!tuts) {
      tuts = this.tutorials.create(uid);
      await this.tutorials.add(tuts);
    }

    return this.tutorialsProvider.pushTutorials(tuts);
  }
}
