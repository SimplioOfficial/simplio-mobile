import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IonInput } from '@ionic/angular';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'sio-pin-value',
  templateUrl: './sio-pin-value.component.html',
  styleUrls: ['./sio-pin-value.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SioPinValueComponent),
      multi: true,
    },
  ],
})
export class SioPinValueComponent implements ControlValueAccessor, OnInit {
  private _emitted = false;

  lengthStruct: string[] = [];
  valueForm = new FormControl('');
  @Input('pin-lengh') pinLength = environment.PIN_LENGTH || 4;
  @Output() pinned = new EventEmitter<string>();
  @ViewChild(IonInput) inputEl: IonInput;

  get pinValue(): string[] {
    const formValue = this.valueForm.value || [];
    return Array.from(formValue, _ => '*');
  }

  get isEmitted(): boolean {
    return this._emitted;
  }

  ngOnInit() {
    this.lengthStruct = Array(this.pinLength).map(_ => '');
  }

  registerOnChange(fn: (value: string) => void) {
    this.valueForm.valueChanges.subscribe(fn);
  }

  registerOnTouched() {}

  updateInputValue(value: number) {
    this.writeValue(value);
  }

  load() {
    this._emitted = true;
  }

  dismiss() {
    this._emitted = false;
  }

  resetInputValue() {
    this._emitted = false;
    this.valueForm.setValue('');
  }

  writeValue(value: number) {
    if (this._emitted) return;

    const oldValue = this.valueForm.value;
    const newValue = `${oldValue}${value}`;

    if (value === -1) {
      // in case of backspace
      this.valueForm.setValue(oldValue.slice(0, -1));
    } else if (newValue.length < this.pinLength) {
      this.valueForm.setValue(newValue);
    } else if (newValue.length === this.pinLength) {
      this.valueForm.setValue(newValue);
      setTimeout(() => {
        this.pinned.emit(newValue);
      }, 300);
    } else {
      this._emitted = true;
      this.pinned.emit(oldValue);
    }
  }
}
