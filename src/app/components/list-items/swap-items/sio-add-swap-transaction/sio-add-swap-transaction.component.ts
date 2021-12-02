import { Component, OnInit, HostBinding } from '@angular/core';

@Component({
  selector: 'sio-add-swap-transaction',
  templateUrl: './sio-add-swap-transaction.component.html',
  styleUrls: ['./sio-add-swap-transaction.component.scss', '../generic-swap-item.scss'],
})
export class SioAddSwapTransactionComponent implements OnInit {
  @HostBinding('class') class = 'ion-activatable ripple-parent';
  ngOnInit() {}
}
