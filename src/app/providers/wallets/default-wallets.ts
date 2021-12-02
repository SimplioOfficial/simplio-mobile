import { Wallet, WalletAddress, WalletType } from 'src/app/interface/data';
import { coinNames } from '../../services/api/coins';

export type DefaultWalletFactory = Pick<Wallet, 'ticker' | 'name' | 'type'> & {
  isLocked: boolean;
  addresses: Array<WalletAddress>;
};

export const defaultWallets = Object.freeze<Record<string, DefaultWalletFactory>>({
  SIO: {
    name: 'Simplio',
    ticker: coinNames.SIO,
    type: WalletType.SOLANA_TOKEN,
    isLocked: true,
    addresses: [],
  },
  SOL: {
    name: 'Solana',
    ticker: coinNames.SOL,
    type: WalletType.SOLANA,
    isLocked: true,
    addresses: [],
  },
  BTC: {
    name: 'Bitcoin',
    ticker: coinNames.BTC,
    type: WalletType.BITCORE_LIB,
    isLocked: true,
    addresses: [],
  },
  ETH: {
    name: 'Ethereum',
    ticker: coinNames.ETH,
    type: WalletType.ETH,
    isLocked: true,
    addresses: [],
  },
  BNB: {
    name: 'Smart Chain',
    ticker: coinNames.BNB,
    type: WalletType.BSC,
    isLocked: true,
    addresses: [],
  },
});
