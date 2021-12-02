import { UserID } from './global';

export type JWTUsersPayload = {
  exp: number;
  http: string;
  iat: number;
  iss: string;
  aud: string;
  phase: AuthenticationPhase;
  sub: string;
  userId: number;
  email_verified: boolean;
  email: string;
  name: string; // default email
  nickname: string; // begining of email
  picture: string; // url to a avatar image
};

export type JWTAccessPayload = {
  exp: number;
  http: string;
  iat: number;
  azp: string;
  aud: string[];
  sub: string;
  scope: string;
  gty: GrandType[];
  permissions: string[];
};

export enum GrandType {
  REFRESH_TOKEN = 'refresh_token',
  PASSWORD = 'password',
}

export enum AuthenticationPhase {
  NOT_REGISTERED,
  CONFIRMED_ABBREVIATED,
  SMS_SENT,
  CONFIRMED,
}

export interface AccountRegistrationItem {
  email: string;
  password: string;
}

export interface AccountCredentials {
  userId: string;
  email: string;
  password: string;
}

export interface AgreementData {
  termsAndConditionsAgreedVersion: string;
  date: string;
  ipAddress: string;
  advertising: boolean;
}

export type AccountCredentialsResponse = {
  id_token: string; // JWT with users info
  expires_in: number;
  refresh_token: string; // JWT
  access_token: string; // JWT
  token_type: string;
};

export type RegisterAccountData = {
  cred: AccountCredentials;
  agreements: AgreementData;
};

export type AccountLoginWithCredentialsResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires: number;
  userid: UserID;
  loginnames: string[];
  complete: boolean;
  firstname: string;
  surname: string;
  notifpriority: number;
  notifunread: number;
};

export type AccountDeviceCredentialsRequestParams = {
  username: string;
  device_id: string;
  device_token: string;
};

export type AccountDeviceCredentialsResponse = {
  access_token: string;
};

export interface GeneralRegistrationResponse {
  device_token: string;
}

export type JwtCertificateResponse = {
  dotnet: string;
  der: string;
  pfx: string;
  thumbprint: string;
  fingerprint: string;
};

export interface BiometricsCredentials {
  pin: string;
}
