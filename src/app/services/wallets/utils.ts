import { Rate, Wallet, WalletType } from 'src/app/interface/data';
import { Acc } from 'src/app/interface/user';
import { BalancePipe } from 'src/app/pipes/balance.pipe';
import { DefaultWalletFactory } from 'src/app/providers/wallets/default-wallets';
import { WalletData } from 'src/app/providers/wallets/wallet-data';

export const createDefaultWalletData = (account: Acc, wf: DefaultWalletFactory): WalletData => {
  const wallet = new WalletData(account);

  wallet.setName(wf.name).setType(wf.type).setTicker(wf.ticker);

  wf.addresses.forEach(a => wallet.pushAddress(a));

  return wallet;
};

export const findPrimaryWallet = (wallets: Wallet[], identificator: string): Wallet => {
  return wallets.find(w => {
    if (w._uuid && w._uuid === identificator) {
      return w;
    } else if (w.name === identificator) {
      return w;
    }
  });
};

export const findWallet = (wallets: Wallet[], ticker: string, type: WalletType): Wallet => {
  return wallets.find(w => w.ticker.toLowerCase() === ticker.toLowerCase() && w.type === type);
};

export const getPrice = (rates: Rate[] = [], ticker: string, currency: string): number => {
  const lc = s => s.toLowerCase();
  return (
    rates.find(r => lc(r.code) === lc(ticker))?.price *
      rates.find(r => lc(r.code) === lc(currency))?.rate || 0
  );
};

export const searchBy = <T>(data: T[], ...keys: string[]): ((s: string) => T[]) => {
  const hasValue = a => b => b.toLowerCase().includes(a.toLowerCase());
  return function searchWithValue(inputValue: string): T[] {
    const hasInputValue = hasValue(inputValue);
    return data.reduce((acc, curr) => {
      const vals = keys.map(k => curr[k]);
      vals.forEach(v => {
        if (typeof v === 'string' && hasInputValue(v)) {
          acc.push(curr);
        }
      });
      return [...new Set(acc)];
    }, []);
  };
};

export const isLocked =
  (defaultWallets: DefaultWalletFactory[]) =>
  (wallet: Wallet): boolean => {
    const up = (s: string) => s.toUpperCase();
    const dw = defaultWallets.find(
      d => up(d.ticker) === up(wallet.ticker) && d.type === wallet.type,
    );
    return dw?.isLocked ?? false;
  };

export const makeBalance =
  (rates: Rate[]) =>
  (wall: Wallet): number => {
    const ratedPrice =
      rates.find(r => r.code.toLowerCase() === wall.ticker.toLowerCase())?.price || 0;
    return Number(
      (
        ratedPrice *
        BalancePipe.prototype.transform(wall.balance, wall.ticker, wall.type, wall.decimal)
      ).toFixed(4),
    );
  };

export const isSameWallet = (w1: Wallet, w2: Wallet) => {
  return w1.ticker === w2.ticker && w1.type === w2.type;
};
