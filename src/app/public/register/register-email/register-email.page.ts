import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountRegistrationItem } from 'src/app/interface/account';
import { Translate } from 'src/app/providers/translate/';

const EMAIL = 'EMAIL';

@Component({
  selector: 'register-email-page',
  templateUrl: './register-email.page.html',
  styleUrls: ['./register-email.page.scss'],
})
export class RegisterEmailPage {
  readonly EMAIL = EMAIL;

  formField = this.fb.group({
    [EMAIL]: [
      '',
      [
        Validators.required,
        Validators.pattern(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/),
        Validators.email,
      ],
    ],
  });

  get isValid(): boolean {
    return this.formField.valid;
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    public $: Translate,
  ) {}

  onSubmit() {
    const state: AccountRegistrationItem = {
      password: '',
      email: this.formField.get(this.EMAIL).value,
    };

    if (this.formField.valid) {
      this.router.navigate(['../../password'], {
        relativeTo: this.route,
        state,
      });
    }
  }
}
