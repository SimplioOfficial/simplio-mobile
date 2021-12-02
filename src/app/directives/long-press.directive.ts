import { Directive, Output, EventEmitter, HostListener } from '@angular/core';
import { Subject, Observable, interval } from 'rxjs';
import { takeUntil, tap, filter } from 'rxjs/operators';

@Directive({
  selector: '[appLongPress]',
})
export class LongPressDirective {
  @Output() pressTime: EventEmitter<number> = new EventEmitter();
  state: Subject<string> = new Subject();
  cancel: Observable<string>;

  constructor() {
    this.cancel = this.state.pipe(
      filter(v => v === 'cancel'),
      tap(v => {
        this.pressTime.emit(0);
      }),
    );
  }

  @HostListener('mouseup', ['$event'])
  @HostListener('mouseleave', ['$event'])
  @HostListener('touchend', ['$event'])
  onExit() {
    this.state.next('cancel');
  }

  @HostListener('mousedown', ['$event'])
  @HostListener('touchstart', ['$event'])
  onPress() {
    this.state.next('start');

    const int = 100;

    interval(int)
      .pipe(
        takeUntil(this.cancel),
        tap(v => {
          this.pressTime.emit(v + int);
        }),
      )
      .subscribe();
  }
}
