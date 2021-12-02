import { Wallet, WalletType } from 'src/app/interface/data';
import {
  BuySwapConvert,
  BuySwapConvertResponse,
  PaymentType,
  SwapPair,
  SwapStatusText,
  SwapStatusTranslations,
} from 'src/app/interface/swap';
import { Translate } from 'src/app/providers/translate';
import { coinNames, platformList } from '../api/coins';

const up = (s: string) => s.toUpperCase();

export const getCurrencyNetwork = (type: WalletType, ticker: string) => {
  switch (type) {
    case WalletType.ETH_TOKEN:
    case WalletType.ETH:
      return platformList.ETH;
    case WalletType.BSC_TOKEN:
    case WalletType.BSC:
      return platformList.BSC;
    case WalletType.SOLANA:
    case WalletType.SOLANA_TOKEN:
      return platformList.SOL;
    default:
      return ticker;
  }
};

export const getWalletType = (ticker: string, network: string): WalletType => {
  switch (network) {
    case platformList.ETH:
      if (up(ticker) === up(coinNames.ETH)) {
        return WalletType.ETH;
      } else {
        return WalletType.ETH_TOKEN;
      }
    case platformList.BSC:
      if (up(ticker) === up(coinNames.BNB)) {
        return WalletType.BSC;
      } else {
        return WalletType.BSC_TOKEN;
      }
    case platformList.SOL:
      if (up(ticker) === up(coinNames.SOL)) {
        return WalletType.SOLANA;
      } else {
        return WalletType.SOLANA_TOKEN;
      }
    default:
      return WalletType.UNKNOWN;
  }
};

export const pairWallet = (
  sourceWallet: Wallet,
  wallets: Wallet[],
  pairs: SwapPair[],
): Wallet[] => {
  const c = [
    ...pairs
      .filter(p => typeof p.SourceCurrency === 'string' && typeof p.TargetCurrency === 'string')
      .filter(p => up(p.SourceCurrency) === up(sourceWallet.ticker))
      .filter(
        p =>
          up(p.SourceCurrencyNetwork) ===
          up(getCurrencyNetwork(sourceWallet.type, sourceWallet.ticker)),
      ),
  ];

  return wallets.reduce((acc, curr) => {
    let cc = c.find(
      e =>
        up(e.TargetCurrency) === up(curr.ticker) &&
        up(e.TargetCurrencyNetwork) === up(getCurrencyNetwork(curr.type, curr.ticker)),
    );
    if (cc && curr.isInitialized) acc.push(curr);
    return acc;
  }, []);
};

export const getAllowedWallets = (wallets: Wallet[], pairs: SwapPair[]): Wallet[] => {
  const allowedCoins = pairs.filter(p => typeof p.SourceCurrency === 'string');
  return wallets.filter(w =>
    allowedCoins.find(
      c =>
        up(c.SourceCurrency) === up(w.ticker) &&
        up(c.SourceCurrencyNetwork) === up(getCurrencyNetwork(w.type, w.ticker)),
    ),
  );
};

export const findSwapFor = (wallets = [], pairList = []) => {
  return function findSwapWithFn(pairFn) {
    return function findSwapOf(walletIdx: number = 0): [Wallet, Wallet] {
      const currW = wallets[walletIdx];
      if (!currW) throw new Error('No wallets to swap');

      const pairs = pairFn(currW, wallets, pairList) || [];
      if (pairs.length) return [currW, pairs[0]];

      return findSwapOf(walletIdx + 1);
    };
  };
};

export const getSwapPair = (
  pairList: SwapPair[] = [],
  sourceCurrency: string,
  sourceCurrencyNetwork: string,
  destinationCurrency: string,
  targetCurrencyNetwork: string,
): SwapPair => {
  const sc = up(sourceCurrency);
  const dc = up(destinationCurrency);
  const scn = up(sourceCurrencyNetwork);
  const tcn = up(targetCurrencyNetwork);
  return pairList.find(
    p =>
      up(p.SourceCurrency) === sc &&
      up(p.SourceCurrencyNetwork) == scn &&
      up(p.TargetCurrency) === dc &&
      up(p.TargetCurrencyNetwork) == tcn,
  );
};

export const referenceCodeHandler =
  (cb = (ref: string, originalRef: string) => {}) =>
  ({ ref = '' }: { ref: string }) => {
    const r = ref.split(' ').join('').slice(0, 49).toUpperCase();
    cb(r, ref);
  };

export const getConvertResponseOf =
  (type: PaymentType) =>
  (res: BuySwapConvertResponse): BuySwapConvert =>
    Array.isArray(res) ? res.find(r => r.PaymentGatewayProvider === type) : res;

export const getSwapStatusTranslations = ($: Translate): SwapStatusTranslations => ({
  [SwapStatusText.Validating]: $.instant($.SWAP_STATUS_VALIDATING_NAME),
  [SwapStatusText.Swapping]: $.instant($.SWAP_STATUS_SWAPPING_NAME),
  [SwapStatusText.Pending]: $.instant($.SWAP_STATUS_PENDING_NAME),
  [SwapStatusText.Withdrawing]: $.instant($.SWAP_STATUS_WITHDRAWING_NAME),
  [SwapStatusText.Delayed]: $.instant($.SWAP_STATUS_WITHDRAWING_NAME),
  [SwapStatusText.Failed]: $.instant($.SWAP_STATUS_FAILED_NAME),
  [SwapStatusText.Completed]: $.instant($.SWAP_STATUS_COMPLETED_NAME),
  [SwapStatusText.Expired]: $.instant($.SWAP_STATUS_EXPIRED_NAME),
});
