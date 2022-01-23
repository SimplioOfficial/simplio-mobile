import { Component, OnInit, Input, ViewChild, ElementRef, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormControl, Validators } from '@angular/forms';

enum ValueType {
  SEPARATOR,
  VALUE,
}

type Field = {
  type: ValueType;
  value: string;
};

@Component({
  selector: 'sio-formated-input',
  templateUrl: './sio-formated-input.component.html',
  styleUrls: ['./sio-formated-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SioFormatedInputComponent),
      multi: true,
    },
  ],
})
export class SioFormatedInputComponent implements OnInit, ControlValueAccessor {
  isFocused = false;
  formatedFields: Field[] = [];

  valueTypes = {
    separator: ValueType.SEPARATOR,
    value: ValueType.VALUE,
  };

  @Input() format = '';
  @Input() separator = '';
  @Input() type = 'tel';
  @Input('is-valid') _isValid = true;

  @ViewChild('inputEl', { static: true }) $input: ElementRef<HTMLInputElement>;

  fieldForm: FormControl = new FormControl('');

  get maxLength(): number {
    return this.format.split(this.separator).join('').length;
  }

  get isValid(): boolean {
    if (this._isValid !== undefined) return !!this._isValid;
    return this.fieldForm.valid;
  }

  writeValue(value: string) {
    const max = this.format.split(this.separator).join('').length;
    if (value.length > max) return;
    this.onChange(value);
    this.fieldForm.setValue(value);
  }

  registerOnChange(fn: (value: string) => void) {
    this.fieldForm.valueChanges.subscribe(val => {
      if (val.length > this.maxLength) return;
      this.onChange(val);
      fn(val);
    });
  }

  registerOnTouched() {}

  setDisabledState() {}

  ngOnInit() {
    this.formatedFields = this.format.split('').map(v => {
      if (v === this.separator) {
        return {
          type: ValueType.SEPARATOR,
          value: this.separator,
        };
      }

      return {
        type: ValueType.VALUE,
        value: '',
      };
    });
  }

  fillFields(fields: Field[], value: string): Field[] {
    const va = fields
      .filter(v => v.type === ValueType.VALUE)
      .map((v, i) => ({ ...v, value: value[i] ?? '' }));

    const separatorIdx = this.format.split('').reduce((acc, curr, i) => {
      if (curr === this.separator) acc.push(i);
      return acc;
    }, []);

    separatorIdx.forEach(i => {
      va.splice(i, 0, {
        type: ValueType.SEPARATOR,
        value: this.separator,
      });
    });

    return va;
  }

  onFocus() {
    this.writeValue('');
    this.$input.nativeElement.focus();
    this.isFocused = true;
  }

  onBlur() {
    this.isFocused = false;
  }

  onChange(value: string) {
    this.formatedFields = this.fillFields(this.formatedFields, value);
  }
}
