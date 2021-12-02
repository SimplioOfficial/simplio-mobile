import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, ModalController } from '@ionic/angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { SeedType } from 'src/app/interface/data';
import { UtilsService, validateSeeds } from 'src/app/services/utils.service';
import { WalletService } from 'src/app/services/wallet.service';
import { Camera } from '@capacitor/camera';
import { Translate } from 'src/app/providers/translate';

@Component({
  selector: 'add-coin-options-modal',
  templateUrl: './add-coin-options.modal.html',
  styleUrls: ['./add-coin-options.modal.scss'],
})
export class AddCoinOptionsModal implements OnInit {
  formField: FormGroup;

  seedTypes: SeedType[] = Object.values(SeedType) as SeedType[];
  @Input() form;

  constructor(
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private qrScanner: BarcodeScanner,
    private utilsService: UtilsService,
    private fb: FormBuilder,
    private walletService: WalletService,
    private $: Translate,
  ) {}

  get hasRecovery(): boolean {
    const seed: string = this.formField.value?.recoverySeed ?? '';
    return !!seed.length;
  }

  get derivationPath(): string {
    return this.formField.value.derivationPath;
  }

  ngOnInit() {
    this.formField = this.fb.group({
      seedType: [this.form.seedType ?? SeedType.BIP44, [Validators.required]],
      recoverySeed: [this.form.recoverySeed],
      derivationPath: [this.form.derivationPath || '', [Validators.required]],
    });
  }

  private _handleQrScanner(prompt: HTMLIonAlertElement) {
    const onSuccess = state => {
      this.qrScanner
        .scan()
        .then(({ text }) => {
          if (typeof text !== 'string' || !validateSeeds(text)) {
            throw new TypeError('Seed is not correct');
          }
          const trimmedSeed = text.trim();
          this.formField.patchValue({ recoverySeed: trimmedSeed });
          prompt.dismiss();
        })
        .catch((err: TypeError) => {
          this.utilsService.showToast(err.message, 1500, 'warning');
        });
    };

    const onError = () => {
      this.utilsService.showToast(this.$.PERMISSION_DENINED, 1500, 'warning');
    };

    Camera.checkPermissions().then(({ camera }) => {
      if (camera === 'granted') {
        return onSuccess(camera);
      } else {
        this.utilsService.grantCameraPermission(onSuccess, onError);
      }
    });
  }

  private _handleInsertedSeed(seed: string) {
    if (!seed.length) return;
    try {
      if (typeof seed !== 'string') {
        throw new TypeError('Seed is not correct');
      }
      seed = seed.toLowerCase();
      if (!validateSeeds(seed)) {
        throw new TypeError('Seed is not correct');
      }
      this.formField.patchValue({ recoverySeed: seed });
    } catch (err) {
      const error: Error = err;
      this.utilsService.showToast(error.message, 1500, 'warning');
    }
  }

  private _handleInsertedPath(path: string) {
    if (!path.length) return;
    try {
      const customPath = path.replace(/'/g, '');
      const split = customPath.split('/');

      function isNumber(n) {
        return !isNaN(parseInt(n)) && !isNaN(n - 0);
      }

      function iV(s: Array<string>) {
        if (
          s.length !== 4 ||
          s[0] !== 'm' ||
          s[1] !== '44' ||
          !isNumber(s[2]) ||
          !isNumber(s[3]) ||
          path.includes('.')
        ) {
          return false;
        }
        return true;
      }

      if (!iV(split)) throw new Error('Path is not valid');
      this.formField.patchValue({ derivationPath: path });
    } catch (err) {
      const error: Error = err;
      this.utilsService.showToast(error.message, 1500, 'warning');
    }
  }

  async openRecoverySeedPrompt() {
    const prompt = await this.alertCtrl.create({
      header: 'Insert recovery seed',
      inputs: [
        {
          name: 'seed',
          type: 'text',
          placeholder: 'seed',
        },
      ],
      buttons: [
        {
          text: 'QR',
          handler: () => this._handleQrScanner(prompt),
        },
        {
          text: 'Apply',
          handler: ({ seed = '' }: { seed: string }) => this._handleInsertedSeed(seed?.trim()),
        },
      ],
    });

    await prompt.present();
  }

  async openDerivationPathPrompt() {
    const prompt = await this.alertCtrl.create({
      header: 'Set derivation path',
      inputs: [
        {
          name: 'path',
          type: 'text',
          placeholder: 'path',
          value: this.derivationPath,
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Apply',
          handler: ({ path = '' }: { path: string }) => this._handleInsertedPath(path),
        },
      ],
    });

    await prompt.present();
  }

  onDismissModal() {
    this.modalCtrl.dismiss({
      form: this.formField.value,
    });
  }
}
