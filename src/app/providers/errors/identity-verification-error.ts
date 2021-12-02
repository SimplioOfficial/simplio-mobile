import { Translate } from 'src/app/providers/translate';
import { HttpErrorResponse } from '@angular/common/http';
import { CodeError } from './code-error';

export type IdentityVerificationErrorCode =
  | 'NOT_REGISTERED'
  | 'NOT_LOGGED_IN'
  | 'NOT_IN_ROLE'
  | 'NO_SUCH_USER'
  | 'INCORRECT_DEVICE_TOKEN'
  | 'INCOMPLETE_REGISTRATION_PROCESS'
  | 'CANNOT_SEND_SMS'
  | 'SMS_RETRY'
  | 'SMS_NOT_SENT'
  | 'SMS_TOO_MANY_ATTEMPTS'
  | 'SMS_EXPIRED'
  | 'NO_BIO_CREDENTIALS';

export class IdentityVerificationError extends CodeError<IdentityVerificationErrorCode> {
  name = 'Identity Verification Error';

  constructor(public httpError: HttpErrorResponse, private $: Translate) {
    super();

    this._default.set('DEFAULT', [this.$.instant(this.$.UNKNOWN_ERROR), 'warning']);

    this._options.set('NO_SUCH_USER', [
      this.$.instant(this.$.EMAIL_OR_PASSWORD_IS_INCORRECT),
      'warning',
    ]);
    this._options.set('NOT_LOGGED_IN', [this.$.instant(this.$.NOT_LOGIN_IN_ERROR), 'warning']);
    this._options.set('NOT_REGISTERED', [this.$.instant(this.$.NOT_REGISTERED_ERROR), 'warning']);
    this._options.set('NOT_IN_ROLE', [this.$.instant(this.$.NOT_IN_ROLE_ERROR), 'warning']);
    this._options.set('INCORRECT_DEVICE_TOKEN', [
      this.$.instant(this.$.INCORRECT_DEVICE_TOKEN_ERROR),
      'warning',
    ]);
    this._options.set('INCOMPLETE_REGISTRATION_PROCESS', [
      this.$.instant(this.$.PLEASE_VERIFY_EMAIL),
      'warning',
    ]);
    this._options.set('CANNOT_SEND_SMS', [this.$.instant(this.$.CANNOT_SEND_SMS_ERROR), 'warning']);
    this._options.set('SMS_RETRY', [this.$.instant(this.$.SMS_RETRY), 'warning']);
    this._options.set('SMS_NOT_SENT', [this.$.instant(this.$.SMS_NOT_SENT_ERROR), 'warning']);
    this._options.set('SMS_TOO_MANY_ATTEMPTS', [
      this.$.instant(this.$.SMS_TOO_MANY_ATTEMPTS_ERROR),
      'warning',
    ]);
    this._options.set('SMS_EXPIRED', [this.$.instant(this.$.SMS_EXPIRED_ERROR), 'warning']);
    this._options.set('NO_BIO_CREDENTIALS', [this.$.instant(this.$.NO_BIO_CREDENTIALS), 'warning']);

    this._init(this.httpError);
  }
}
