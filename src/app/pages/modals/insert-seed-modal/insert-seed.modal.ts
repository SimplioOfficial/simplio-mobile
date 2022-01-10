import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Translate } from 'src/app/providers/translate/';
import { checkWord } from 'src/shared/validators';

@Component({
  selector: 'insert-seed-modal',
  templateUrl: './insert-seed.modal.html',
  styleUrls: ['./insert-seed.modal.scss'],
})
export class InsertSeedModal implements AfterViewInit {
  @Input() index: number;
  @Input() finished = false;
  @Input() word = '';

  @ViewChild('seedInput') seedInput;

  formField: FormGroup = this.fb.group(
    {
      word: [this.word, [Validators.required]],
    },
    {
      validators: [checkWord],
    },
  );

  constructor(private modalCtrl: ModalController, private fb: FormBuilder, public $: Translate) {}

  ngAfterViewInit(): void {
    setTimeout(() => this.seedInput.setFocus(), 600);
  }

  continue() {
    this.modalCtrl.dismiss();
  }

  onDismissModal(modified = false): void {
    this.modalCtrl.dismiss({
      index: this.index,
      value: this.formField.get('word').value?.trim().toLowerCase(),
      modified,
    });
  }

  onSubmit() {
    if (this.formField.valid) this.onDismissModal(true);
  }
}
