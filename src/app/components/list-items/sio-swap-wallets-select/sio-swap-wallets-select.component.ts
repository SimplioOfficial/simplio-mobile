import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Wallet } from 'src/app/interface/data';
import { EmptyStatus } from 'src/app/components/list-items/sio-select-empty/sio-select-empty.component';

@Component({
  selector: 'sio-swap-wallets-select',
  templateUrl: './sio-swap-wallets-select.component.html',
  styleUrls: ['../generic-item.scss', './sio-swap-wallets-select.component.scss'],
})
export class SioSwapWalletsSelectComponent {
  @Input() label = '';
  @Input() sourceWallet: Wallet;
  @Input() destinationWallet: Wallet;
  @Input() isLoading = true;
  @Input('error-title') private _errorTitle: string;
  @Input('empty-title') private _emptyTitle: string;

  @Output() selected = new EventEmitter();

  onClick(e) {
    this.selected.emit(e);
  }

  get isEmpty(): boolean {
    return !this.sourceWallet || !this.destinationWallet;
  }

  get hasError(): boolean {
    return !!this._errorTitle;
  }

  get hideContent(): boolean {
    return this.hasError || this.isEmpty;
  }

  get emptyStatus(): EmptyStatus {
    if (this.hasError) return EmptyStatus.Error;
    if (this.isEmpty) return EmptyStatus.Empty;
    else return EmptyStatus.Empty;
  }

  get emptyTitle(): string {
    return !!this._emptyTitle ? this._emptyTitle : this._emptyTitle;
  }
}
