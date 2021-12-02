import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { SwapPair, SwapType } from '../interface/swap';
import { SingleSwapService } from '../services/swap/single-swap.service';
import { CommonSwap } from '../services/swap/swap-common';
import { SettingsProvider } from '../providers/data/settings.provider';
import { SwapProvider } from '../providers/data/swap.provider';
import { UtilsService } from '../services/utils.service';
import { Translate } from '../providers/translate';

class SwapDataResolver implements Resolve<SwapPair[]> {
  constructor(
    protected singleSwap: CommonSwap,
    protected swapProvider: SwapProvider,
    protected utilsService: UtilsService,
    protected $: Translate,
    protected type: SwapType,
    protected settingsProvider?: SettingsProvider,
  ) {}

  resolve(): Promise<SwapPair[]> {
    this.swapProvider.updateSwapStatus(true);
    return this._fetchSwapPairList();
  }

  private async _fetchSwapPairList(): Promise<SwapPair[]> {
    return this.singleSwap
      .getList()
      .then(swapPairs => {
        return swapPairs.filter(p => p.IsEnabled).filter(p => p.SwapType === this.type);
      })
      .catch(_ => {
        this.swapProvider.updateSwapStatus(false);
        throw this.utilsService.showToast(this.$.LISTING_AVAILABLE_SWAPS_FAILED, 3000, 'warning');
      });
  }
}

@Injectable({ providedIn: 'root' })
class SingleSwapResolver extends SwapDataResolver {
  constructor(
    protected singleSwap: SingleSwapService,
    protected swapProvider: SwapProvider,
    protected utilsService: UtilsService,
    protected $: Translate,
  ) {
    super(singleSwap, swapProvider, utilsService, $, SwapType.Single);
  }
}

export const getSwapDataResolverOf = (swapType = SwapType.Single) => {
  switch (swapType) {
    case SwapType.Single:
      return SingleSwapResolver;
  }
};
