import { WalletAddress } from 'src/app/interface/data';
import { DataResponse, WallletAddressSqlData } from 'src/app/interface/sqlite-data';

export const toBool = (val: number) => Boolean(val);
export const fromBool = (val: boolean) => (val ? 1 : 0);
export const getData = <T>({ rows }: DataResponse<T>): T[] => {
  const d = [];
  for (let i = 0; i < rows.length; ++i) {
    d.push(rows.item(i));
  }
  return d;
};
export const getItem = <T>({ rows }: DataResponse<T>, i: number) =>
  rows.length ? rows.item(i) : null;

export const filterWalletAddresses = (
  uuid,
  addresses: WallletAddressSqlData[],
): WalletAddress[] => {
  return addresses
    .filter(a => a._uuid === uuid)
    .reduce<WalletAddress[]>((acc, curr) => {
      const addr: WalletAddress = {
        _uuid: curr._uuid,
        address: curr.addr,
        balance: curr.balance,
        derivePath: curr.derive_path,
      };
      acc.push(addr);
      return acc;
    }, []);
};
