export const SWAP_CACHE_KEY = 'scch';
export const TRANSACTION_CACHE_KEY = 'tcch';

export interface Cacher<T> {
  save(data: T[]): Promise<T[]>;
  load(): Promise<T[]>;
  clear(): Promise<void>;
}
