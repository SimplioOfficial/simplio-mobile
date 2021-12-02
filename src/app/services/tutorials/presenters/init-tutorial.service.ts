import { Injectable } from '@angular/core';
import { TutorialsProvider } from 'src/app/providers/data/tutorials.provider';
import {
  Component,
  TutorialPresenter,
  TutorialPresenterService,
} from 'src/app/services/tutorials/presenters/tutorial-presenter.service';
import { TutorialsService } from 'src/app/services/tutorials/tutorials.service';

@Injectable()
export class InitTutorialService implements TutorialPresenter {
  constructor(
    private tutsProvider: TutorialsProvider,
    private tuts: TutorialsService,
    private presenter: TutorialPresenterService,
  ) {}

  create(component: Component): Promise<void> {
    return this.presenter
      .create({
        tutorial: this.tutsProvider.tutorialsValue.tutInit,
        component,
      })
      .then(res => this.tuts.update({ tutInit: res }))
      .catch(() => {})
      .then(() => {});
  }
}
