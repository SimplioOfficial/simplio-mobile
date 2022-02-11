import { makeURL } from 'src/app/providers/routes/utils.routes';
import { environment } from 'src/environments/environment';

const base = environment.SWIPELUX;
const base2 = environment.SWAP_URL;

const url = makeURL(base).bind(null, '/api');
const url2 = makeURL(base2).bind(null, '/api');

export const SWIPELUX_URL = Object.freeze({
  pairs: url('currencies/pairs'),
  fromTo: url('currencies/pairs'),
  currentOrders: url('orders/current'),
  payment: url('orders/current/payment'),
  kycVerification: url('verifications/kyc'),

  orders: url2('swipelux/orders'),
});
