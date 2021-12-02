import { Translate } from 'src/app/providers/translate';
import { HttpErrorResponse } from '@angular/common/http';
import { CodeError } from './code-error';

export type AccountRegistrationErrorCode =
  | 'DUPLICATE'
  | 'INSUFF_INPUT'
  | 'EMAIL_SERVER_ERROR'
  | 'TEMPLATE_NOT_FOUND'
  | 'TEMPLATE_DAMAGE'
  | 'WRONG_ORIGINAL_PASSWORD'
  | 'TOO_SIMPLE_PASSWORD'
  | 'NO_SUCH_USER'
  | 'INCONSEQUENTIAL';

export class AccountRegistrationError extends CodeError<AccountRegistrationErrorCode> {
  name = 'Account Registration Error';

  constructor(public httpError: HttpErrorResponse, private $: Translate) {
    super();

    this._default.set('DEFAULT', [this.$.instant(this.$.UNKNOWN_ERROR), 'warning']);

    this._options.set('DUPLICATE', [
      this.$.instant(this.$.THIS_EMAIL_IS_NOT_AVAILABLE_PLEASE_CHOOSE_ANOTHER_ONE),
      'warning',
    ]);
    this._options.set('INSUFF_INPUT', [
      this.$.instant(this.$.WALLET_WITH_THE_SAME_NAME_ALREADY_EXISTS),
      'warning',
    ]);
    this._options.set('EMAIL_SERVER_ERROR', [
      this.$.instant(this.$.WALLET_WITH_THE_SAME_NAME_ALREADY_EXISTS),
      'warning',
    ]);
    this._options.set('TEMPLATE_DAMAGE', [
      this.$.instant(this.$.WALLET_WITH_THE_SAME_NAME_ALREADY_EXISTS),
      'warning',
    ]);
    this._options.set('TEMPLATE_NOT_FOUND', [
      this.$.instant(this.$.WALLET_WITH_THE_SAME_NAME_ALREADY_EXISTS),
      'warning',
    ]);
    this._options.set('TOO_SIMPLE_PASSWORD', [
      this.$.instant(this.$.WALLET_WITH_THE_SAME_NAME_ALREADY_EXISTS),
      'warning',
    ]);
    this._options.set('WRONG_ORIGINAL_PASSWORD', [
      this.$.instant(this.$.PASSWORD_CHANGE_ORIGINAL_ERROR),
      'warning',
    ]);
    this._options.set('INCONSEQUENTIAL', [
      this.$.instant(this.$.WALLET_WITH_THE_SAME_NAME_ALREADY_EXISTS),
      'warning',
    ]);
    this._options.set('NO_SUCH_USER', [this.$.instant(this.$.NO_USER), 'warning']);

    this._init(this.httpError);
  }
}
