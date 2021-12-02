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

const base3 = environment.USER_API;
const urlv3 = makeURL(base3).bind(null, '/api/v1');

export const KYC_URLS = Object.freeze({
  sumsubToken: urlv3('sumsub/token'),
  sumsubApplicant: urlv3('sumsub/applicant'),
  verificationsRecors: urlv3('account/verification-record'),
});
