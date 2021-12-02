import { FeeName, SupportedFiat, TxRefreshInterval } from './data';
import { UserID, UUID } from './global';

export interface Settings {
  uid: UserID;
  refresh: TxRefreshInterval | number;
  language: string;
  currency: SupportedFiat;
  feePolicy: FeeName;
  primaryWallet: UUID;
  graph: GraphSettings;
  theme: ThemeSettings;
}

export interface ThemeSettings {
  mode: ThemeMode;
  accent: AccentColor;
}

export interface GraphSettings {
  enableGraph: boolean;
  period: string;
}

export enum AccentColor {
  default = 'default',
  blue = 'blue',
  red = 'red',
  orange = 'orange',
  purple = 'purple',
  mono = 'mono',
}

export enum ThemeMode {
  light,
  dark,
}

export enum ChartView {
  Day = '1D',
  Week = '1W',
  Month = '1M',
  Quarter = '3M',
}
