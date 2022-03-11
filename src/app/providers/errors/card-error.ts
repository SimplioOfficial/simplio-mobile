import { Translate } from 'src/app/providers/translate';
import { HttpErrorResponse } from '@angular/common/http';
import { CodeError } from './code-error';

export type CardErrorCode =
  | 'NO_SUCH_USER'
  | 'NOT_REGISTERED'
  | 'NOT_LOGGED_IN'
  | 'NOT_IN_ROLE'
  | 'INSUFF_INPUT'
  | 'NOT_IN_DATABASE'
  | 'KYC_NEEDED'
  | 'NOT_SUITABLE_CARD_PROGRAM'
  | 'NEED_FURTHER_DATA'
  | 'CANNOT_EXECUTE'
  | 'NO_SUCH_CARD';

export class CardError extends CodeError<CardErrorCode> {
  name = 'Card Error';

  constructor(public httpError: HttpErrorResponse, private $: Translate) {
    super();

    this._default.set('DEFAULT', [
      this.$.instant(this.$.WALLET_WITH_THE_SAME_NAME_ALREADY_EXISTS),
      'warning',
    ]);

    this._options.set('NO_SUCH_USER', [
      this.$.instant(this.$.EMAIL_OR_PASSWORD_IS_INCORRECT),
      'warning',
    ]);

    this._options.set('NOT_REGISTERED', [
      this.$.instant(this.$.EMAIL_OR_PASSWORD_IS_INCORRECT),
      'warning',
    ]);

    this._options.set('NOT_LOGGED_IN', [
      this.$.instant(this.$.EMAIL_OR_PASSWORD_IS_INCORRECT),
      'warning',
    ]);

    this._options.set('NOT_IN_ROLE', [
      this.$.instant(this.$.EMAIL_OR_PASSWORD_IS_INCORRECT),
      'warning',
    ]);

    this._options.set('INSUFF_INPUT', [
      this.$.instant(this.$.EMAIL_OR_PASSWORD_IS_INCORRECT),
      'warning',
    ]);

    this._options.set('NOT_IN_DATABASE', [
      this.$.instant(this.$.EMAIL_OR_PASSWORD_IS_INCORRECT),
      'warning',
    ]);

    this._options.set('KYC_NEEDED', [
      this.$.instant(this.$.EMAIL_OR_PASSWORD_IS_INCORRECT),
      'warning',
    ]);

    this._options.set('NOT_SUITABLE_CARD_PROGRAM', [
      this.$.instant(this.$.EMAIL_OR_PASSWORD_IS_INCORRECT),
      'warning',
    ]);

    this._options.set('CANNOT_EXECUTE', [
      this.$.instant(this.$.EMAIL_OR_PASSWORD_IS_INCORRECT),
      'warning',
    ]);

    this._options.set('NEED_FURTHER_DATA', [
      this.$.instant(this.$.EMAIL_OR_PASSWORD_IS_INCORRECT),
      'warning',
    ]);

    this._init(this.httpError);
  }
}
