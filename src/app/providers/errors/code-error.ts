import { PredefinedColors } from '@ionic/core';
import { HttpErrorResponse } from '@angular/common/http';

type ErrorDefaultCode = 'DEFAULT';

export class CodeError<T> extends Error {
  protected _options: Map<T, [string, PredefinedColors]> = new Map();
  protected _default: Map<ErrorDefaultCode, [string, PredefinedColors]> = new Map();

  color: PredefinedColors;
  code: T;
  status: number;

  constructor() {
    super();
  }

  protected _init(httpErrorResponse: HttpErrorResponse) {
    this.code = httpErrorResponse.error?.code;
    this.status = httpErrorResponse.status;

    const [message, color] = this._options.has(this.code)
      ? this._options.get(this.code)
      : this._default.get('DEFAULT');

    this.message = message;
    this.color = color;
  }
}
