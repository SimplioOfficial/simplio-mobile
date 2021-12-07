import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { Subscription } from 'rxjs';
import { LoadingController, ModalController } from '@ionic/angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { TranslateService } from '@ngx-translate/core';

import {
  Pair,
  SignedTransaction,
  SolFeeToken,
  UnsignedTransaction,
  Wallet,
  WalletType,
} from 'src/app/interface/data';
import { isToken, pipeAmount, UtilsService } from 'src/app/services/utils.service';
import { DataService } from 'src/app/services/data.service';
import { Translate } from 'src/app/providers/translate/';
import { IoService } from 'src/app/services/io.service';
import { Feev2Service } from 'src/app/services/apiv2/connection/feev2.service';
import { Camera } from '@capacitor/camera';
import { AbiService } from 'src/app/services/apiv2/connection/abi.service';
import { TransactionsService } from 'src/app/services/transactions.service';
import { AuthenticationProvider } from 'src/app/providers/data/authentication.provider';
import { RateService } from 'src/app/services/apiv2/connection/rate.service';
import { WalletsProvider } from 'src/app/providers/data/wallets.provider';
import { coinNames } from 'src/app/services/api/coins';
import { CheckWalletsService } from 'src/app/services/wallets/check-wallets.service';
import { MultiFactorAuthenticationService } from 'src/app/services/authentication/mfa.service';
import { TransactionWalletsModal } from '../../modals/transaction-wallets-modal/transaction-wallets.modal';
import { isSameWallet } from 'src/app/services/wallets/utils';
import { CoinsService } from 'src/app/services/apiv2/connection/coins.service';
import { WalletService } from 'src/app/services/wallet.service';
import { BalancePipe } from 'src/app/pipes/balance.pipe';
import { SioSearchComponent } from '../../../components/layout/sio-search/sio-search.component';
import { SettingsProvider } from 'src/app/providers/data/settings.provider';
import { BackendService } from 'src/app/services/apiv2/blockchain/backend.service';

@Component({
  selector: 'app-send-address',
  templateUrl: './send-address.page.html',
  styleUrls: ['./send-address.page.scss'],
})
export class SendAddressPage implements OnInit, OnDestroy {
  @ViewChild('searchComponent') searchComponent: SioSearchComponent;

  private _originUrl = this.router.getCurrentNavigation().extras.state?.origin || '/home/wallets';
  private wallet = this.router.getCurrentNavigation().extras.state?.wallet;
  contactsSubscription: Subscription;
  unsignedTransaction: UnsignedTransaction<SignedTransaction> | null = null;
  address: string;
  disableSend = true;
  loading: any;
  contacts: Pair[] = [];
  isQr = false;
  filteredContacts: Pair[];
  currency = this.settingsProvider.settingsValue.currency;
  _wallets: Wallet[];
  _feeWallet: Wallet;
  _solTokenFeePercentage = 0.5;
  _solFeeList: SolFeeToken[] = [
    {
      type: WalletType.SOLANA,
      ticker: 'SOL',
    },
    /* {
      type: WalletType.SOLANA_TOKEN_DEV,
      ticker: 'SRM'
    },
    {
      type: WalletType.SOLANA_TOKEN_DEV,
      ticker: 'RAY'
    },
    {
      type: WalletType.SOLANA_TOKEN_DEV,
      ticker: 'USDT'
    },
    {
      type: WalletType.SOLANA_TOKEN_DEV,
      ticker: 'USDC'
    } */
  ];
  canProceed = false;
  broadcasting = false;

  wallets$ = this.walletsProvider.wallets$.subscribe(w => {
    this._wallets = w;
    if (!this._feeWallet) {
      this._feeWallet = w.find(e => e.ticker === coinNames.SOL && UtilsService.isSolana(e.type));
    }
  });

  constructor(
    private router: Router,
    private authProvider: AuthenticationProvider,
    private transactionService: TransactionsService,
    private dataService: DataService,
    private loadingController: LoadingController,
    private utilsService: UtilsService,
    private barcodeScanner: BarcodeScanner,
    private abiService: AbiService,
    private translateService: TranslateService,
    private ioService: IoService,
    public $: Translate,
    private feeService: Feev2Service,
    private rateService: RateService,
    private walletsProvider: WalletsProvider,
    private walletService: WalletService,
    private checker: CheckWalletsService,
    private mfa: MultiFactorAuthenticationService,
    private modalCtrl: ModalController,
    private coinsService: CoinsService,
    private settingsProvider: SettingsProvider,
    private backendService: BackendService,
  ) {
    this.unsignedTransaction = this.dataService.unsignedTransaction;
    this.unsignedTransaction.keepAlive = true;
  }

  ngOnInit() {
    this.filteredContacts = this.contacts || [];
    let f = this.coinsService.getFeeSolCoins();
    f = f.filter(e => !this._solFeeList.find(ee => e.ticker === ee.ticker));
    this._solFeeList = this._solFeeList.concat(f);
    this._solTokenFeePercentage = this.coinsService.getFeePercentageSolCoins();
  }

  ngOnDestroy() {
    this.wallets$.unsubscribe();
  }

  get isPolkadot() {
    return UtilsService.isPolkadot(this.unsignedTransaction.wallet.type);
  }

  get shouldShowFeeList() {
    return (
      UtilsService.isSolanaToken(this.unsignedTransaction.wallet.type) &&
      this._solFeeList.length > 0
    );
  }

  instant = s => this.translateService.instant(s);

  back() {
    this.router.navigate(['/home', 'wallets', 'send'], {
      state: {
        wallet: this.unsignedTransaction.wallet,
      },
    });
  }

  private _updateFeePipe() {
    const { ticker, type, decimal } = this.unsignedTransaction.wallet;
    const feeWallet = this.walletService.getWalletByCoinType(ticker, type);
    this.unsignedTransaction.feepipe = {
      ticker,
      type,
      decimal,
      wallet: feeWallet,
    };

    switch (type) {
      case WalletType.BSC_TOKEN:
        this.unsignedTransaction.feepipe = {
          ticker: coinNames.BNB,
          type: WalletType.BSC,
          decimal: 18,
          wallet: this.walletService.getWalletByCoinType(coinNames.BNB, WalletType.BSC),
        };
        break;
      case WalletType.SOLANA_TOKEN:
      case WalletType.SOLANA_TOKEN_DEV:
        this.unsignedTransaction.feepipe = {
          ticker: coinNames.SOL,
          type: WalletType.SOLANA,
          decimal: 9,
          wallet: this.walletService.getWalletByCoinType(coinNames.SOL, WalletType.SOLANA),
        };
        break;
      case WalletType.ETH_TOKEN:
        this.unsignedTransaction.feepipe = {
          ticker: coinNames.ETH,
          type: WalletType.ETH,
          decimal: 18,
          wallet: this.walletService.getWalletByCoinType(coinNames.ETH, WalletType.ETH),
        };
        break;
      default:
        break;
    }
  }

  private _createFeeErrorMsg(feeWallet: Wallet, feeAmount: number) {
    const tf = (n: number, s: string, t: WalletType, d: number) =>
      BalancePipe.prototype.transform(n, s, t, d);

    let chainMsg = '';
    switch (feeWallet.type) {
      case WalletType.ETH:
        chainMsg = 'ETH';
        break;
      case WalletType.BSC:
        chainMsg = 'BNB (Smart Chain)';
        break;
      case WalletType.SOLANA:
        chainMsg = 'SOL';
        break;
      default:
        chainMsg = feeWallet.ticker;
        break;
    }
    return `Insufficient amount, you need more ${chainMsg} in address ${
      feeWallet.mainAddress
    } for the fee or decrease fee level, current balance ${tf(
      feeWallet.balance,
      feeWallet.ticker,
      feeWallet.type,
      feeWallet.decimal,
    )} , expected balance ${tf(feeAmount, feeWallet.ticker, feeWallet.type, feeWallet.decimal)}`;
  }

  private async _calculateFee() {
    console.log('calculate fee');
    await this.presentLoading(this.$.SIGNING_TRANSACTION);
    const { wallet } = this.unsignedTransaction;

    if (wallet.unconfirmed > 0) {
      throw new Error(this.instant(this.$.WAIT_FOR_CONFIRMATION));
    }
    try {
      this.address = this.address.trim();
      this.unsignedTransaction.address = this.address;
      const abi = this.ioService.getAbi(wallet.contractaddress, wallet.type);
      let tokenData = {};
      if (UtilsService.isErcToken(wallet.type) && !abi?.length) {
        const abiData = {
          contractaddress: wallet.contractaddress,
          type: wallet.type,
          abi: await this.abiService.getAbi({
            ticker: wallet.ticker,
            type: wallet.type,
            contractAddress: wallet.contractaddress,
          }),
        };
        await this.ioService.addAbi(abiData);
      }

      this._updateFeePipe();
      if (
        UtilsService.isSolanaToken(wallet.type) &&
        this._feeWallet &&
        !UtilsService.isSolana(this._feeWallet)
      ) {
        const decimal = this._feeWallet.decimal;
        const ticker = this._feeWallet.ticker;
        tokenData = {
          decimal,
          ticker,
        };
        this.unsignedTransaction.feepipe.decimal = decimal;
        this.unsignedTransaction.feepipe.ticker = ticker;
      }
      return this.feeService
        .estimatedFee({
          ticker: wallet.ticker,
          type: wallet.type,
          ismax: this.unsignedTransaction.isMax,
          address: this.address,
          amount: this.unsignedTransaction.amount,
          from: wallet.mainAddress,
          feePrice: this.unsignedTransaction.fee.price,
          minFee: this.unsignedTransaction.fee.minFee,
          utxos: this.unsignedTransaction.utxo,
          abi,
          contractAddress: wallet.contractaddress,
          api: wallet.api,
          signature: 1,
          rates: this.rateService.rateValue,
          tokenData,
        })
        .then(res => {
          if (
            UtilsService.isSolanaToken(wallet.type) &&
            this._feeWallet &&
            !UtilsService.isSolana(this._feeWallet.type)
          ) {
            res.fees += res.fees * this._solTokenFeePercentage;
          }
          this.unsignedTransaction.signature = {
            fee: res.fees,
            amount: res.amount,
            utxo: res.utxoToUse,
            change: res.change,
            gasLimit: res.gasLimit,
            gasPrice: res.gasPrice,
          };
          if (
            isToken(wallet.type) &&
            this.dataService.unsignedTransaction.signature.amount >
              this.dataService.unsignedTransaction.wallet.balance
          ) {
            throw new Error(this.instant(this.$.INSUFFICIENT_AMOUNT));
          } else if (
            this.dataService.unsignedTransaction.signature.amount + res.fees >
            this.dataService.unsignedTransaction.wallet.balance
          ) {
            throw new Error(this.instant(this.$.INSUFFICIENT_AMOUNT));
          }
          if (res.fees > this.unsignedTransaction.feepipe.wallet.balance) {
            throw new Error(
              this._createFeeErrorMsg(this.unsignedTransaction.feepipe.wallet, res.fees),
            );
          }
          if (res.amount < 0) {
            throw new Error(this.instant(this.$.NOT_ENOUGH_COIN));
          }
        });
    } catch (_) {
      throw new Error(this.instant(this.$.TRANSACTION_ISSUE));
    }
  }

  onSearchContent(e) {
    const { value } = e.target;
    this.address = value;
    this.isQr = false;
    this.filteredContacts = this.filterContacts(value);
    this.validateAddress()
      .then(async _ => {
        await this.dismissLoading();
      })
      .catch(async err => {
        await this.dismissLoading();
        return this.utilsService.showToast(err.message, 3000, 'warning');
      });
  }

  /**
   * Opening a Camera for QR scanning if permission is granted
   */
  openQr() {
    const onPermissionGranted = _ => {
      this.barcodeScanner
        .scan()
        .then(async barcodeData => {
          const splt = barcodeData.text.split(':');
          this.searchComponent.focusSearch(null);
          this.address = splt[splt.length - 1];
          if (this.address !== '') {
            await this.validateAddress();
            await this.dismissLoading();
            this.isQr = true;
            console.log('Barcode data', barcodeData);
          }
        })
        .catch(err => {
          console.log('Error', err);
        });
    };

    const onPermissionDenied = (err: Error) => {
      console.error(err.message);
    };

    this._grantCameraPermission(onPermissionGranted, onPermissionDenied);
  }

  async presentLoading(msg) {
    this.loading = await this.loadingController.create({
      message: this.instant(msg),
      duration: 25000,
    });
    await this.loading.present();
  }

  async dismissLoading() {
    if (this.loading) {
      await this.loading.dismiss();
    }
  }

  selectContact(contact: Pair) {
    this.address = contact.address;
    this.isQr = false;
    this.validateAddress()
      .then(async _ => {
        await this.dismissLoading();
      })
      .catch(async err => {
        await this.dismissLoading();
        return this.utilsService.showToast(err.message, 3000, 'warning');
      });
  }

  validateData(): Promise<any> {
    return new Promise(async (res, rej) => {
      if (!this.address) rej();

      const address = this.address;
      const coin = this.unsignedTransaction.wallet.ticker;
      const wType = this.unsignedTransaction.wallet.type;

      if (!(address && coin && wType !== undefined)) {
        return rej(new Error('Missing values'));
      }

      const isValid = await this.backendService.validateAddress({
        ticker: this.unsignedTransaction.wallet.ticker,
        type: this.unsignedTransaction.wallet.type,
        address,
        mint: this.unsignedTransaction.wallet.contractaddress,
        api: this.unsignedTransaction.wallet.api,
      });
      if (!isValid) {
        return rej(new Error('Address is not valid'));
      }
      return res(address);
    });
  }

  /**
   *
   * @todo resolve a 'prompt' state for permission PWA and native
   * @note on native platform should prompt automatically
   */
  private _grantCameraPermission(onSuccess = (r: any) => {}, onError = (err: any) => {}) {
    Camera.checkPermissions().then(({ camera }) => {
      if (camera === 'granted') {
        return onSuccess(camera);
      } else {
        this.utilsService.grantCameraPermission(onSuccess, onError);
      }
    });
  }

  private filterContacts(value: string = ''): Pair[] {
    const filterReducer = filter => c => {
      const normalize = v =>
        v
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase();

      const normalizedName = normalize(c.name);
      const normalizedFilter = normalize(filter);
      const includesValue = normalizedName.includes(normalizedFilter) || c.address.includes(filter);
      return includesValue && filter;
    };
    const boundFn = filterReducer(value);

    if (value !== '') {
      return this.contacts.filter(boundFn);
    }
    return this.contacts;
  }

  private async validateAddress(): Promise<any> {
    return this.validateData()
      .then(async () => {
        const { wallet } = this.unsignedTransaction;
        try {
          // check if it's solana token and have not initialized
          if (UtilsService.isSolanaToken(wallet.type)) {
            // check if address is not created
            await this.presentLoading(this.$.VALIDATING_ADDRESS);
            const data = await this.walletService.getTokenAddress({
              type: wallet.type,
              contractAddress: wallet.contractaddress,
              address: this.address,
              api: wallet.api,
            });

            const { idt } = this.authProvider.accountValue;
            // check token transaction
            const txs = await this.transactionService.getTransactionOfAsync({
              _uuid: wallet._uuid,
              ticker: wallet.ticker,
              type: wallet.type,
              addresses: [data.toString()],
              tokenAddress: wallet.tokenAddress,
              lastBlock: 0,
              api: wallet.api,
              tokenId: wallet.contractaddress,
              seeds: this.ioService.decrypt(wallet.mnemo, idt),
              wallet,
            });
            await this.dismissLoading();
            if (txs.data.length === 0) {
              return this.presentCreateReceiverTokenAccountPrompt(this.address);
            } else {
              await this._calculateFee();
            }
          } else {
            await this._calculateFee();
          }
          this.disableSend = false;
          await this.dismissLoading();
        } catch (err) {
          this.disableSend = true;
          throw err;
        }
      })
      .catch(async err => {
        console.log(err);
        this.disableSend = true;
        throw err;
      });
  }

  private _check = (w: Wallet) => {
    this.checker.checkNewTransactions(w);
  };

  private async _broadcast() {
    await this.presentLoading(this.$.SENDING);
    this.broadcasting = true;
    return this.backendService
      .createTransaction({
        _uuid: this.unsignedTransaction.wallet._uuid,
        seeds: this.unsignedTransaction.mnemo,
        explorer: this.unsignedTransaction.explorer,
        addresses: this.unsignedTransaction.wallet.addresses,
        ticker: this.unsignedTransaction.wallet.ticker,
        receiver: this.unsignedTransaction.address,
        type: this.unsignedTransaction.wallet.type,
        amount: this.unsignedTransaction.signature.amount,
        fee: this.unsignedTransaction.signature.fee,
        utxos: this.unsignedTransaction.signature.utxo,
        change: this.unsignedTransaction.signature.change,
        gasLimit: this.unsignedTransaction.signature.gasLimit,
        gasPrice: this.unsignedTransaction.signature.gasPrice,
        balance: this.unsignedTransaction.wallet.balance,
        abi: this.ioService.getAbi(
          this.unsignedTransaction.wallet.contractaddress,
          this.unsignedTransaction.wallet.type,
        ),
        contractAddress: this.unsignedTransaction.wallet.contractaddress,
        lasttx: this.unsignedTransaction.wallet.lasttx,
        api: this.unsignedTransaction.wallet.api,
        feeContractAddress: this._feeWallet.contractaddress, // for paying fee in token only for SPL token
      })
      .then(res => {
        console.log('Transaction txid', res);
        this.dismissLoading();
        this.broadcasting = false;
        this._check(this.unsignedTransaction.wallet);
        this.router.navigate(['home', 'wallets', 'send', 'sendconfirm'], {
          state: {
            wallet: this.wallet,
            origin: this._originUrl,
          },
        });
      })
      .catch(err => {
        this.dismissLoading();
        this.broadcasting = false;
        console.log(err);
        throw new Error(err.error ? err.error : err.message);
      });
  }

  async onSubmit() {
    const modal = await this.mfa.showIdentityVerificationModal({
      fullScreen: true,
      attempts: 3,
      warnAt: 2,
    });

    const {
      data: {
        result: [isVerified],
      },
    } = await modal.onWillDismiss();

    if (isVerified)
      return this._broadcast().catch(err => {
        this.utilsService.showToast(err.message, 3000, 'warning');
      });

    this.utilsService.showToast(this.$.INCORRECT_PIN, 3000, 'warning');
  }

  toggleKeepAlive({ checked }) {
    this.unsignedTransaction.keepAlive = !checked;
  }

  async presentCreateReceiverTokenAccountPrompt(address) {
    const { wallet } = this.unsignedTransaction;
    const { idt } = this.authProvider.accountValue;

    const minimumRent = await this.backendService.solana.getMinimumRentExemption({
      api: wallet.api,
    });

    const alertMsg = this.instant(this.$.CREATE_NEW_SOLANA_TOKEN_ACCOUNT_RECEIVER_FEE);
    const alert = await this.utilsService.createAlert({
      header: this.$.CREATE_NEW_SOLANA_TOKEN_ACCOUNT,
      message: alertMsg.replace(
        '<value>',
        pipeAmount(
          minimumRent,
          coinNames.SOL,
          WalletType.SOLANA,
          UtilsService.getDecimals(WalletType.SOLANA, coinNames.SOL),
          true,
        ).toString(),
      ),
      buttons: [
        {
          text: this.$.CANCEL,
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: this.$.CREATE,
          handler: async () => {
            const solWallet = this._wallets.find(
              e => e.ticker === coinNames.SOL && UtilsService.isSolana(e.type),
            );
            if (!solWallet || minimumRent > solWallet.balance) {
              const errorMsg = this.instant(this.$.CREATE_NEW_SOLANA_TOKEN_ACCOUNT_ERROR);
              throw new Error(
                errorMsg.replace(
                  '<value>',
                  pipeAmount(
                    minimumRent,
                    coinNames.SOL,
                    WalletType.SOLANA,
                    UtilsService.getDecimals(WalletType.SOLANA, coinNames.SOL),
                    true,
                  ).toString(),
                ),
              );
            } else {
              this.disableSend = true;
              await this.presentLoading(this.$.INITIALIZING_TOKEN);
              try {
                await this.backendService.solana.createTokenAddress({
                  address: address,
                  api: wallet.api,
                  contractAddress: wallet.contractaddress,
                  seeds: this.ioService.decrypt(wallet.mnemo, idt),
                });
                await this.dismissLoading();
                await this._calculateFee();
              } catch (error) {
                await this.dismissLoading();
                this.utilsService.showToast(error.message, 2000, 'warning');
              }
              this.disableSend = false;
            }
          },
        },
      ],
    });

    await alert.present();
  }

  private _presentModal(modal, props = {}): Promise<HTMLIonModalElement> {
    return this.modalCtrl
      .create({
        component: modal,
        componentProps: props,
      })
      .then(modal => {
        modal.present();
        return modal;
      });
  }

  async openSelectWalletModal() {
    const modal = await this._presentModal(TransactionWalletsModal, {
      wallets: this._wallets.filter(w =>
        this._solFeeList.find(
          s => s.ticker.toLowerCase() === w.ticker.toLowerCase() && s.type === w.type,
        ),
      ),
      currency: this.currency,
    });
    modal
      .onWillDismiss()
      .then(wallet => {
        if (wallet.data) {
          if (!isSameWallet(this._feeWallet, wallet.data)) {
            this._feeWallet = wallet.data;
            this.validateAddress()
              .then(async _ => {
                await this.dismissLoading();
              })
              .catch(async err => {
                await this.dismissLoading();
                return this.utilsService.showToast(err.message, 3000, 'warning');
              });
          }
        }
      })
      .catch(_ =>
        this.utilsService.showToast(this.$.WALLET_COULD_NOT_BE_SELECTED, 2000, 'warning'),
      );
  }
}
