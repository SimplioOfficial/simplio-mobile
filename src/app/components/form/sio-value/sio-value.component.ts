import {
  AfterViewInit,
  Component,
  EventEmitter,
  forwardRef,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';

import { IonInput } from '@ionic/angular';

import { pipeAmount, UtilsService } from 'src/app/services/utils.service';
import { Wallet } from 'src/app/interface/data';

@Component({
  selector: 'sio-value',
  templateUrl: './sio-value.component.html',
  styleUrls: ['./sio-value.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SioValueComponent),
      multi: true,
    },
  ],
})
export class SioValueComponent implements AfterViewInit, ControlValueAccessor {
  @Input() ticker!: string;
  @Input() currency!: string;
  @Input() rate!: number;
  @Input() max!: number;
  @Input() wallet!: Wallet;

  @Input() loading = false;
  @Input() useMaxBtn = true;
  @Input() useSwitchBtn = true;
  @Input() useFiatAsDefault = false;

  @Output() maxClicked = new EventEmitter();
  @ViewChild(IonInput) inputEl: IonInput;

  valueForm = new FormControl(0);

  inputValue = '0';

  private isCoin = true;
  private fontSize = 38;

  ngAfterViewInit() {
    if (this.useFiatAsDefault) {
      setTimeout(() => this.onSwap());
    }
  }

  onMax() {
    const coin = pipeAmount(
      this.max,
      this.wallet.ticker,
      this.wallet.type,
      this.wallet.decimal,
      true,
    );
    const fiat = coin * this.rate;
    const coinValue =
      coin === 0 ? '0' : parseFloat((Math.trunc(coin * 1e8) / 1e8).toFixed(8)).toString();
    const fiatValue = fiat === 0 ? '0' : parseFloat(fiat.toFixed(8)).toString();
    this.inputValue = this.isCoin ? coinValue : fiatValue;
    this.writeValue(this.max);
    this.maxClicked.emit(true);
    this._resizeAmount();
  }

  onSwap() {
    const swappedValue = this.swappedAmount;
    this.isCoin = !this.isCoin;
    this.inputValue = swappedValue;
    this._resizeAmount();
  }

  registerOnChange(fn: (value: string) => void) {
    this.valueForm.valueChanges.subscribe(fn);
  }

  registerOnTouched() {}

  updateInputValue(value: number) {
    this.inputValue = UtilsService.resolveNumpadValue(value, this.inputValue);
    const amountNum = this.isCoin ? parseFloat(this.inputValue) : parseFloat(this.swappedAmount);
    this.maxClicked.emit(false);
    this.writeValue(this._getFinalValue(amountNum));
    this._resizeAmount();
  }

  updateInputValueFromOutside(value: number) {
    for (let i = 0; i < value.toString().length; i++) {
      const char = value.toString().charAt(i) !== '.' ? Number(value.toString().charAt(i)) : 10;
      this.updateInputValue(char);
    }
  }

  writeValue(value: number) {
    this.valueForm.setValue(value);
  }

  get currentCurrency(): string {
    return this.isCoin ? this.ticker : this.currency;
  }

  get swappedAmount(): string {
    const v = parseFloat(this.inputValue);
    const value = this.isCoin ? this._rateCurrency(v) : this._rateCoin(v);
    return value.toString();
  }

  get swapedCurrency(): string {
    return this.isCoin ? this.currency : this.ticker;
  }

  private _getFinalValue(amount: number): number {
    if (!UtilsService.isPolkadot(this.wallet.type)) {
      const pi = parseInt;
      return pi(
        pipeAmount(amount, this.wallet.ticker, this.wallet.type, this.wallet.decimal).toFixed(0),
      );
    } else {
      return amount;
    }
  }

  private _rateCoin(amount: number): number {
    const a = amount.toFixed(8);
    const b = Number(a) / this.rate;
    return parseFloat(b.toFixed(8));
  }

  private _rateCurrency(amount: number): number {
    const a = amount.toFixed(8);
    const b = Number(a) * this.rate;
    return parseFloat(b.toFixed(8));
  }

  /**
   * @todo Make a resizing a util fn
   */
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
