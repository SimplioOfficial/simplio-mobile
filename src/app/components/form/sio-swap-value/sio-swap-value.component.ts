import { Component, EventEmitter, forwardRef, Input, Output, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';

import { IonInput } from '@ionic/angular';

import { UtilsService } from 'src/app/services/utils.service';
import { Wallet } from 'src/app/interface/data';

@Component({
  selector: 'sio-swap-value',
  templateUrl: './sio-swap-value.component.html',
  styleUrls: ['./sio-swap-value.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SioSwapValueComponent),
      multi: true,
    },
  ],
})
export class SioSwapValueComponent implements ControlValueAccessor {
  @Input() sourceWallet: Wallet;
  @Input() destinationWallet: Wallet;
  @Input() swapValue: number | null = 0;
  @Input() isPending = false;

  @Output() maxClicked = new EventEmitter();

  @ViewChild(IonInput) inputEl: IonInput;

  valueForm: FormControl = new FormControl(0);
  inputValue = '0';

  @Input('convertedAmount') private privateConvertedAmount = 0;
  private isCoin = true;
  private fontSize = 38;
  private privateFinalAmount = 0;

  constructor() {}

  onMax() {
    this.maxClicked.emit(true);
  }

  registerOnChange(fn: (value: string) => void) {
    this.valueForm.valueChanges.subscribe(fn);
  }

  registerOnTouched() {}

  resetInputValue() {
    this.inputValue = '0';
    this.privateConvertedAmount = 0;
  }

  setDisabledState() {}

  updateInputValue(value: number) {
    this.inputValue = UtilsService.resolveNumpadValue(value, this.inputValue);
    this._resizeAmount();
    // this.maxClicked.emit(false);
    const finalAmount = this._getFinalValue(parseFloat(this.inputValue));
    if (this.finalAmount !== finalAmount) {
      this.finalAmount = finalAmount;
    }
  }

  // this is the value, not numpad
  updateInputValueFinal(value: number) {
    this.inputValue = value.toString();
    this._resizeAmount();
    const finalAmount = this._getFinalValue(parseFloat(this.inputValue));
    if (this.finalAmount !== finalAmount) {
      this.finalAmount = finalAmount;
    }
  }

  writeValue(value: number) {
    this.valueForm.setValue(value);
  }

  get convertedAmount(): number {
    return parseFloat(this.privateConvertedAmount.toFixed(8));
  }

  get currentCurrency(): string {
    return this.isCoin
      ? this.sourceWallet?.ticker.toUpperCase()
      : this.destinationWallet?.ticker.toUpperCase();
  }

  get finalAmount(): number {
    return this.privateFinalAmount;
  }

  set finalAmount(v: number) {
    this.privateFinalAmount = v;
    this.writeValue(this.privateFinalAmount);
  }

  get swappedCurrency(): string {
    return this.isCoin
      ? this.destinationWallet?.ticker.toUpperCase()
      : this.sourceWallet?.ticker.toUpperCase();
  }

  private _getFinalValue(amount: number): number {
    return Math.trunc(amount * 1e8) / 1e8;
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
}
