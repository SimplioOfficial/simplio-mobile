import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { filter, takeWhile } from 'rxjs/operators';
import { Tutorials } from 'src/app/interface/tutorials';

@Injectable()
export class TutorialsProvider {
  private _tutorials = new BehaviorSubject<Tutorials>(null);
  tutorials$ = this._tutorials.pipe(takeWhile(tut => !!tut));

  get tutorialsValue(): Tutorials {
    return this._tutorials.value;
  }

  pushTutorials(tutorials: Tutorials): Tutorials {
    this._tutorials.next(tutorials);
    return tutorials;
  }
}
