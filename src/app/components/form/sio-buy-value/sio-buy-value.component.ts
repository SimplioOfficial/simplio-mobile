import { Component, forwardRef, Input, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IonInput } from '@ionic/angular';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'sio-buy-value',
  templateUrl: './sio-buy-value.component.html',
  styleUrls: ['./sio-buy-value.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SioBuyValueComponent),
      multi: true,
    },
  ],
})
export class SioBuyValueComponent implements ControlValueAccessor {
  @Input() currency = '';
  @Input('targetAmount') private _targetAmount = 0;
  @Input() targetCurrency = '';
  @Input() loading = false;
  @Input() decimalPlaces: number;

  @ViewChild(IonInput) inputEl: IonInput;

  valueForm = new FormControl(0);
  inputValue = '0';

  private fontSize = 38;

  registerOnChange(fn: (value: string) => void) {
    this.valueForm.valueChanges.subscribe(fn);
  }

  registerOnTouched() {}

  resetInputValue() {
    this.inputValue = '0';
  }

  updateInputValue(value: number) {
    if (this.decimalPlaces !== undefined && this.decimalPlaces > 0) {
      const decimalPart = UtilsService.resolveNumpadValue(value, this.inputValue).split('.')[1];
      const decimalPartLength = !!decimalPart ? decimalPart.length : 0;

      if (decimalPartLength <= this.decimalPlaces) {
        this.resolveNumpad(value);
      }
    } else {
      this.resolveNumpad(value);
    }
  }

  writeValue(value: number) {
    this.valueForm.setValue(value);
  }

  get targetAmount(): number {
    return Math.max(0, this._targetAmount);
  }

  private _resizeAmount() {
    if (!this.inputEl) {
      return;
    }
    this.inputEl.getInputElement().then(el => {
      const l = this.inputValue.toString().length;
      if (l > 4 && l < 8) {
        this.fontSize = 28;
        el.style.fontSize = this.fontSize + 'px';
      } else if (l >= 8 && l < 12) {
        this.fontSize = 20;
      } else if (l >= 12) {
        this.fontSize = 14;
      } else if (l <= 4) {
        this.fontSize = 38;
      }
      el.style.fontSize = this.fontSize + 'px';
    });
  }

  private resolveNumpad(value: number) {
    this.inputValue = UtilsService.resolveNumpadValue(value, this.inputValue);
    const amountNum = parseFloat(this.inputValue);
    this.writeValue(amountNum);
    this._resizeAmount();
  }
}
