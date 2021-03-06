import { environment } from 'src/environments/environment';
import { makeURL } from 'src/app/providers/routes/utils.routes';

const base = environment.SWAP_URL;

const url = makeURL(base).bind(null, '/api');

export const SWAP_URLS = Object.freeze({
  wallets: url('/wallets'),
  walletAddresses: url('/wallets/addresses'),
  linkedAccount: url('/wallets/account'),
  unlinkAddress: url('/wallets/account/unlink'),
  listSwaps: url('/swaps'),
  report: url('/swaps/reports'),
  singleSwap: url('/swaps/single'),
  singleSwapParams: url('/swaps/single/params'),
});

export const USERS_URLS = Object.freeze({
  account: url('users/account'),
  email: url('users/account/email'),
  access: url('users/token/issue'),
  refresh: url('users/token/refresh'),
  password: url('users/account/change-password'),
  reset: url('users/account/reset-password'),
  data: url('users/data'),
});

export const AGREEMENTS_URL = Object.freeze({
  agreements: url('agreements'),
});

const base2 = environment.SWAP_URL_DEX;
const urlv2 = makeURL(base2).bind(null, '/api');
export const USERS_URLS_V2 = Object.freeze({
  account: urlv2('users/account'),
  access: urlv2('users/token/issue'),
  refresh: urlv2('users/token/refresh'),
  password: urlv2('users/account/change-password'),
  reset: urlv2('users/account/reset-password'),
  data: urlv2('users/data'),
});
