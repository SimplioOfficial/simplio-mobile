import {
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';

import { IonContent } from '@ionic/angular';

@Component({
  selector: 'sio-page',
  templateUrl: './sio-page.component.html',
  styleUrls: ['./sio-page.component.scss'],
})
export class SioPageComponent {
  @Input() actionPlaceholder = 'Search';
  @Input() hasTapbar = true;
  @Input() hasHeader = true;
  @Input() hasFooter = false;
  @Input() scrollableY = true;
  @Input('search-disabled') disabledSearch = false;

  @Output() refreshed = new EventEmitter();
  @Output() searched = new EventEmitter<string>();
  @Output() searchCanceled = new EventEmitter<boolean>();
  @Output() searchFocused = new EventEmitter<boolean>();
  @Output() scrollStart = new EventEmitter<any>();
  @Output() scrolling = new EventEmitter<any>();
  @Output() scrollEnd = new EventEmitter<any>();

  // @todo add comment about this magic number
  safeArea = 44;
  isOpen = false;
  isSearching = false;

  @ViewChild('headerEl', { static: false }) headerEl: ElementRef<HTMLDivElement>;
  @ViewChild('actionEl', { static: false }) actionEl: ElementRef<HTMLDivElement>;
  @ViewChild('dashEl', { static: false }) dashEl: ElementRef<HTMLDivElement>;
  @ViewChild('mainEl', { static: false }) mainEl: IonContent;

  @ContentChild('headerTemplate', { static: false }) headerTemplateRef: TemplateRef<any>;

  private top = 0;

  constructor() {}

  onRefreshContent(e) {
    this.refreshed.emit(e);
  }

  onScroll() {
    const { top } = this.dashEl.nativeElement.getBoundingClientRect();
    if (!this.isOpen && top < -100) {
      this.isOpen = true;
    } else if (this.isOpen && top > -100) {
      this.isOpen = false;
    }

    this.scrolling.emit(top);
  }

  onScrollEnd(e) {
    this.scrollEnd.emit(e);
  }

  onScrollStart(e) {
    this.scrollStart.emit(e);
    const top = this.headerEl?.nativeElement?.clientHeight || 0;
    this.top = top;
    this.actionEl.nativeElement.style.top = top + 'px';
  }

  onSearchContent(e: InputEvent) {
    const imp = e.target as HTMLInputElement;
    this.searched.emit(imp.value);
  }

  onSearchFocus([state]) {
    this.mainEl.scrollToTop().then(() => {
      this.isSearching = state;
      this.isOpen = state;
    });
    this.searchFocused.emit(state);
    if (!state) this.searchCanceled.emit(state);
  }

  get refreshable(): boolean {
    return Boolean(!this.refreshed.observers.length);
  }

  get searchable(): boolean {
    return Boolean(this.searched.observers.length);
  }
}
