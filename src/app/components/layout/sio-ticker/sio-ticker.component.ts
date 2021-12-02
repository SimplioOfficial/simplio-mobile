import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';

@Component({
  selector: 'sio-ticker',
  templateUrl: './sio-ticker.component.html',
  styleUrls: ['./sio-ticker.component.scss'],
})
export class SioTickerComponent implements AfterViewInit, OnInit, OnDestroy {
  @Input() stickyClass: string | undefined;
  @Output() stuck = new EventEmitter(false);
  isStuck = false;

  private intersectionOptions: IntersectionObserverInit = {
    threshold: 1,
  };
  private observer: IntersectionObserver = null;

  constructor(private el: ElementRef, private zone: NgZone) {}

  ngOnInit() {}

  ngAfterViewInit() {
    if (!IntersectionObserver) {
      return;
    }

    this.zone.runOutsideAngular(() => {
      this.observer = new IntersectionObserver(
        ([e]) => this.zone.run(this.handleEntry.bind(this, e)),
        this.intersectionOptions,
      );
      this.observer.observe(this.el.nativeElement);
    });
  }

  ngOnDestroy() {
    if (!this.observer) {
      return;
    }
    this.observer.disconnect();
    this.observer = null;
  }

  private handleEntry(entry: IntersectionObserverEntry): void {
    const { top: bTop } = entry.boundingClientRect;
    const { top: iTop } = entry.intersectionRect;
    const { intersectionRatio: iR } = entry;

    this.isStuck = bTop < iTop && iR < 1;
    this.stuck.emit(this.isStuck);
  }
}
