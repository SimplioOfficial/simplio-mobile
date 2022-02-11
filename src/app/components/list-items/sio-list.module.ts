import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SioSharedModule } from '../shared/sio-shared.module';
import { IonicModule } from '@ionic/angular';
// components
import { SioWalletItemComponent } from './sio-wallet-item/sio-wallet-item.component';
import { SioWalletThumbnailComponent } from './thumbnails/sio-wallet-thumbnail/sio-wallet-thumbnail.component';
import { SioTransactionItemComponent } from './sio-transaction-item/sio-transaction-item.component';
import { SioContactThumbnailComponent } from './thumbnails/sio-contact-thumbnail/sio-contact-thumbnail.component';
import { SioWalletItemSelectComponent } from './sio-wallet-item-select/sio-wallet-item-select.component';
import { SioCoinItemComponent } from './sio-coin-item/sio-coin-item.component';
import { SioSwapWalletsSelectComponent } from './sio-swap-wallets-select/sio-swap-wallets-select.component';
import { SioSwapItemComponent } from './sio-swap-item/sio-swap-item.component';
import { SioSwapPendingItemComponent } from './swap-items/sio-swap-pending-item/sio-swap-pending-item.component';
import { SelectWalletComponent } from './sio-wallet-item-select/select-wallet/select-wallet.component';
import { SelectEmptyComponent } from './sio-wallet-item-select/select-empty/select-empty.component';
import { SioSwapPairsComponent } from './sio-swap-pairs/sio-swap-pairs.component';
import { SioProgressCircleComponent } from './sio-progress-circle/sio-progress-circle.component';
import { SioActionItemComponent } from 'src/app/components/list-items/sio-action-item/sio-action-item.component';
import { SioActionListComponent } from 'src/app/components/list-items/sio-action-list/sio-action-list.component';
import { SioLoadingTransactionItemComponent } from 'src/app/components/list-items/sio-loading-transaction-item/sio-loading-transaction-item.component';
import { SioSelectEmptyComponent } from './sio-select-empty/sio-select-empty.component';
import { SioAddSwapTransactionComponent } from './swap-items/sio-add-swap-transaction/sio-add-swap-transaction.component';
import { SioWalletColoredThumbnailComponent } from 'src/app/components/list-items/thumbnails/sio-wallet-colored-thumbnail/sio-wallet-colored-thumbnail.component';
import { SioLoadingSwapPendingItemComponent } from 'src/app/components/list-items/swap-items/sio-loading-swap-pending-item/sio-loading-swap-pending-item.component';
import { SioTransactionProgressComponent } from 'src/app/components/list-items/sio-transaction-progress/sio-transaction-progress.component';
import { SioSwapEmptyComponent } from 'src/app/components/list-items/sio-swap-empty/sio-swap-empty.component';
import { SioPurchaseItemComponent } from 'src/app/components/list-items/sio-purchase-item/sio-purchase-item.component';
import { SioStakeTransactionItemComponent } from './sio-stake-transaction-item/sio-stake-transaction-item.component';
import { SioStakeItemComponent } from 'src/app/components/list-items/sio-stake-item/sio-stake-item.component';
import { SioTransactionThumbnailComponent } from 'src/app/components/list-items/thumbnails/sio-transaction-thumbnail/sio-transaction-thumbnail.component';
import { SioCountryCodeComponent } from './sio-phone-code/sio-country-code.component';

@NgModule({
  imports: [SioSharedModule, CommonModule, IonicModule, SioSharedModule],
  declarations: [
    SioPurchaseItemComponent,
    SelectWalletComponent,
    SelectEmptyComponent,
    SioWalletThumbnailComponent,
    SioTransactionThumbnailComponent,
    SioContactThumbnailComponent,
    SioWalletItemComponent,
    SioTransactionItemComponent,
    SioWalletItemSelectComponent,
    SioCoinItemComponent,
    SioSwapWalletsSelectComponent,
    SioSwapItemComponent,
    SioSwapPendingItemComponent,
    SioProgressCircleComponent,
    SioSwapPairsComponent,
    SioActionItemComponent,
    SioActionListComponent,
    SioLoadingTransactionItemComponent,
    SioSelectEmptyComponent,
    SioAddSwapTransactionComponent,
    SioWalletColoredThumbnailComponent,
    SioLoadingSwapPendingItemComponent,
    SioTransactionProgressComponent,
    SioSwapEmptyComponent,
    SioStakeTransactionItemComponent,
    SioStakeItemComponent,
    SioCountryCodeComponent,
  ],
  exports: [
    SioWalletItemComponent,
    SioTransactionItemComponent,
    SioWalletThumbnailComponent,
    SioTransactionThumbnailComponent,
    SioWalletItemSelectComponent,
    SioCoinItemComponent,
    SioSwapWalletsSelectComponent,
    SioSwapItemComponent,
    SioSwapPendingItemComponent,
    SioProgressCircleComponent,
    SioSwapPairsComponent,
    SioActionItemComponent,
    SioActionListComponent,
    SioLoadingTransactionItemComponent,
    SioAddSwapTransactionComponent,
    SioWalletColoredThumbnailComponent,
    SioLoadingSwapPendingItemComponent,
    SioTransactionProgressComponent,
    SioSwapEmptyComponent,
    SioCountryCodeComponent,
    SioPurchaseItemComponent,
    SioStakeTransactionItemComponent,
    SioStakeItemComponent,
  ],
})
export class SioListModule {}
