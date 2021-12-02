import { Injectable } from '@angular/core';
import { Cacher, SWAP_CACHE_KEY } from 'src/app/interface/cacher';
import { SwapCache, SwapConnectionReport, SwapReportItem } from 'src/app/interface/swap';
import { CacheProvider } from 'src/app/providers/data/cache.provider';
import { SwapProvider } from 'src/app/providers/data/swap.provider';
import { IoService } from '../io.service';

@Injectable({
  providedIn: 'root',
})
export class SwapCacheService implements Cacher<SwapReportItem> {
  constructor(
    private io: IoService,
    private cacheProvider: CacheProvider,
    private swapProvider: SwapProvider,
  ) {}

  save(data: SwapReportItem[]): Promise<SwapReportItem[]> {
    return this.io.saveCache<SwapReportItem>({
      key: SWAP_CACHE_KEY,
      data,
    });
  }

  load(): Promise<SwapReportItem[]> {
    console.log('Loading swap cache');
    return this.io.loadCache<SwapReportItem>(SWAP_CACHE_KEY);
  }

  clear(): Promise<void> {
    return;
  }

  update(data: SwapConnectionReport) {}

  private async _updateSwapItem(swap: SwapReportItem) {}
}
