import { Component, Input } from '@angular/core';

export type TransactionProgressItem = {
  isActive: boolean;
  isFilled: boolean;
  text: string;
  label: string;
};

@Component({
  selector: 'sio-transaction-progress',
  templateUrl: './sio-transaction-progress.component.html',
  styleUrls: ['./sio-transaction-progress.component.scss'],
})
export class SioTransactionProgressComponent {
  @Input() index = 0;
  @Input() color = '';
  @Input() item: TransactionProgressItem = {
    isActive: false,
    isFilled: false,
    text: '',
    label: '',
  };
}
