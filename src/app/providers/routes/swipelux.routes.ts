import { makeURL } from 'src/app/providers/routes/utils.routes';
import { environment } from 'src/environments/environment';

const base = environment.SWIPELUX;
const baseNew = environment.SWIPELUX_NEW;
const base2 = environment.SWAP_URL;

const url = makeURL(base).bind(null, '/api');
const urlNew = makeURL(baseNew).bind(null, '/api');
const url2 = makeURL(base2).bind(null, '/api');

export const SWIPELUX_URL = Object.freeze({
  merchantAuth: url('merchants/auth'),
  merchantOrders: url('merchants/orders'),
  currencies: url('currencies'),
  pairs: url('currencies/pairs'),
  fromTo: url('currencies/pairs'),

  authenticateAndCreateOrder: url('orders'),
  currentOrders: url('orders/current'),
  email: url('orders/current/email'),
  address: url('orders/current/target'),
  payment: url('orders/current/payment'),

  phoneVerification: url('verifications/phone'),
  emailVerification: url('verifications/email'),
  kycVerification: url('verifications/kyc'),

  orders: url2('swipelux/orders'),

  createByShareToken: urlNew('orders/createByShareToken'),
  authenticateTemp: urlNew('auth/login'),
});
