import {
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  Output,
  ViewChild,
} from '@angular/core';

export enum SearchType {
  STATIC,
  DYNAMIC,
}

@Component({
  selector: 'sio-search',
  templateUrl: './sio-search.component.html',
  styleUrls: ['./sio-search.component.scss'],
})
export class SioSearchComponent {
  readonly TYPES = {
    static: SearchType.STATIC,
    dynamic: SearchType.DYNAMIC,
  };

  @ViewChild('inputEl') inputEl: ElementRef<HTMLInputElement>;

  @Input('type') searchType = SearchType.DYNAMIC;
  @Input('placeholder') private _placeholder: string;
  @Input() @HostBinding('class.is-disabled') disabled = false;

  @Input() value = '';
  @Input() hasSearchIcon = true;
  @Output() searched = new EventEmitter();
  @Output() focused = new EventEmitter(false);

  isFocused = false;

  constructor() {}

  get placeholder(): string {
    return this._placeholder ? this._placeholder : '';
  }

  cancelFocus(e) {
    this.isFocused = false;
    this.focused.emit([false, e]);
    this.value = '';
  }

  focusSearch(e) {
    this.isFocused = true;
    this.focused.emit([true, e]);
  }

  focus() {
    this.focusSearch(null);
    this.inputEl.nativeElement.focus();
  }

  onSearchEvent(e) {
    this.searched.emit(e);
  }

  @HostBinding('class.is-focused') get getFocusClass(): boolean {
    return this.isFocused;
  }
}
