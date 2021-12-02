import { Injectable } from '@angular/core';
import { IoService } from '../io.service';
import { Tutorials } from 'src/app/interface/tutorials';
import { UserID } from 'src/app/interface/global';
import { createTutorials } from 'src/app/services/tutorials/utils';
import { TutorialsProvider } from 'src/app/providers/data/tutorials.provider';

@Injectable({
  providedIn: 'root',
})
export class TutorialsService {
  constructor(private io: IoService, private tutorialsProvider: TutorialsProvider) {}

  create(uid): Tutorials {
    return createTutorials(uid);
  }

  add(tutorials: Tutorials) {
    return this.io.addTutorials(tutorials);
  }

  update(tutorials: Partial<Tutorials>): Promise<Tutorials> {
    const current = this.tutorialsProvider.tutorialsValue;
    const updated: Tutorials = { ...current, ...tutorials };
    return this.io.updateTutorials(updated).then(t => this.tutorialsProvider.pushTutorials(t));
  }

  remove(tutorials?: Tutorials): Promise<void> {
    const { uid } = tutorials ?? this.tutorialsProvider.tutorialsValue;
    return this.io.removeTutorials(uid);
  }

  get(uid: UserID): Promise<Tutorials> {
    return this.io.getTutorials(uid);
  }

  clean() {}
}
