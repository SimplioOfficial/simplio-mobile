/* tslint:disable:no-empty-interface */
import {
  HubConnectionBuilder,
  HubConnection,
  IHttpConnectionOptions,
  LogLevel,
} from '@microsoft/signalr';

import { environment } from 'src/environments/environment';

// @todo why do we need empty interface? Is it prepared for future?
export interface Connection extends HubConnection {}
interface ConnectionOptions extends IHttpConnectionOptions {}
interface Builder extends HubConnectionBuilder {}

type Connector = () => Builder;

export enum Events {
  UPDATE_SWAP_REPORT = 'UpdateSwapReport',
  PAYMENT_GATEWAY_SUCCESS = 'FiatGatewayPaymentCompleted',
  PAYMENT_GATEWAY_FAILURE = 'FiatGatewayPaymentFailed',
  PAYMENT_GATEWAY_EXPIRED = 'FiatGatewayPaymentExpired',
  PAYMENT_GATEWAY_CANCELLED = 'FiatGatewayPaymentCancelled',
  CONNECTION_TERMINATED = 'ConnectionTerminated',
}

export const SWAP_URL = environment.SWAP_WS_URL;

const connectionFactory = (
  connector: Connector,
  url: string,
  opt: ConnectionOptions = {},
): Connection => {
  const connection: Builder = connector();
  return connection.withUrl(url, Object.assign({}, opt)).configureLogging(LogLevel.Warning).build();
};

export const hubConnector: Connector = () => new HubConnectionBuilder();
export const connect: (url: string, opt: ConnectionOptions) => Connection = connectionFactory.bind(
  null,
  hubConnector,
);
