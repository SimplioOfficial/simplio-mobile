import { environment } from '../../../environments/environment';
import { makeURL } from './utils.routes';

const base = environment.SWAP_URL;

const url = makeURL(base).bind(null, '/api');

export const USERS_URLS = Object.freeze({
  account: url('users/account'),
  email: url('users/account/email'),
  access: url('users/token/issue'),
  refresh: url('users/token/refresh'),
  password: url('users/account/change-password'),
  reset: url('users/account/reset-password'),
  data: url('users/data'),
});

const base3 = environment.USER_API;
const urlv3 = makeURL(base3).bind(null, '/api');

export const KYC_URLS = Object.freeze({
  accessToken: urlv3('sumsub/access-token'),
  shareToken: urlv3('sumsub/share-token'),
  verificationRecord: urlv3('account/verification-record'),
});
