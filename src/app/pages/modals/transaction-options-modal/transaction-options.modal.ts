import { Component, OnInit, Input } from '@angular/core';

import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Fee, FeeName } from 'src/app/interface/data';
import { Translate } from 'src/app/providers/translate/';
import { Feev2Service } from 'src/app/services/apiv2/connection/feev2.service';

@Component({
  selector: 'transaction-options-modal',
  templateUrl: './transaction-options.modal.html',
  styleUrls: ['./transaction-options.modal.scss'],
})
export class TransactionOptionsModal implements OnInit {
  @Input() coin!: string;
  @Input() feeLevelName = 'Normal';

  feeLevels: FeeName[] = Object.values(FeeName) as FeeName[];
  fee: Fee;

  feeSubscription: Subscription;

  constructor(
    private modalCtrl: ModalController,
    private feeService: Feev2Service,
    public $: Translate,
  ) {}

  ngOnInit(): void {}

  onDismissModal(): void {
    this.modalCtrl.dismiss({
      fee: this.feeLevelName,
    });
  }
}
