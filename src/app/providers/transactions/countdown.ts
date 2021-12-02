import { BehaviorSubject, interval, NEVER, Subject, Subscription } from 'rxjs';
import { startWith, scan, switchMap, tap, takeWhile } from 'rxjs/operators';

type Refresher = { pause?: boolean; counter?: number };

export class Countdown {
  private readonly refreshCounter = new Subject<Refresher>();
  counter$ = this.refreshCounter.asObservable();

  private canProceed = new BehaviorSubject<boolean>(false);
  canProceed$ = this.canProceed.asObservable();

  constructor(public refreshTime: number = 10) {}

  initCounter(): Subscription {
    return this.refreshCounter
      .pipe(
        startWith({ pause: false, counter: 0 }),
        scan<Refresher>((acc, curr) => ({ ...acc, ...curr })),
        tap(() => this.canProceed.next(true)),
        switchMap(state =>
          state.pause
            ? NEVER
            : interval(1000).pipe(
                takeWhile(() => {
                  if (state.counter === this.refreshTime) {
                    this.canProceed.next(false);
                  }
                  if (state.counter < this.refreshTime + 1) {
                    state.counter++;
                  }
                  return state.counter < this.refreshTime + 1;
                }),
              ),
        ),
      )
      .subscribe();
  }

  unsubscribe() {
    this.refreshCounter.unsubscribe();
  }

  pause(pause: boolean) {
    this.refreshCounter.next({ pause });
  }

  reset() {
    this.refreshCounter.next({ pause: false, counter: 0 });
  }
}
