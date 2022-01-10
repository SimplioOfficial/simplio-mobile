import { Component, Input, OnInit } from '@angular/core';
import { TxType } from 'src/app/interface/data';

@Component({
  selector: 'sio-stake-transaction-item',
  templateUrl: './sio-stake-transaction-item.component.html',
  styleUrls: ['./sio-stake-transaction-item.component.scss', '../generic-item.scss']
})
export class SioStakeTransactionItemComponent {
  @Input() amount = 0;
  @Input() date = '';
  @Input('address') addr = '';
  @Input() ticker = '';
  @Input('transaction-type') txType: TxType = TxType.UNKNOWN;
}
