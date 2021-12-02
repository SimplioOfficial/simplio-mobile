import { UniqueID } from './global';

export enum IdentityVerificationLevel {
  NONE,
  PIN,
  BIOMETRICS_OFF,
  BIOMETRICS_ON,
}

export interface Acc {
  // email: string;
  // uid: UserID; // user id
  // idt: string; // pin
  // did: string; // device id
  // dtk: string; // device token
  // lvl: IdentityVerificationLevel; // Security level

  email: string;
  uid: UniqueID; // user id
  atk: string;
  tkt: string;
  rtk: string; // refresh token
  idt: string; // pin
  lvl: IdentityVerificationLevel; // security level
}

// export interface Account {
//   _uuid: UUID;
//   email: string;
//   recover: string;
//   check: string;
//   idt: string | null;
//   lvl: IdentityVerificationLevel;
// }

export type AccLog = Pick<Acc, 'uid' | 'idt' | 'lvl'>;
