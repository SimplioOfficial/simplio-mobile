import { Injectable } from '@angular/core';
import { Abi, Wallet, WalletType } from 'src/app/interface/data';
import { Acc } from 'src/app/interface/user';
import { AuthenticationProvider } from 'src/app/providers/data/authentication.provider';
import { WalletsProvider } from 'src/app/providers/data/wallets.provider';
import { WalletData } from 'src/app/providers/wallets/wallet-data';
import { IoService } from 'src/app/services/io.service';
import { WalletsCreator, WalletService } from 'src/app/services/wallet.service';
import { isSolanaToken, isSafecoinToken, Utils } from '@simplio/backend/utils';
import { getCoinDerive } from '../apiv2/utils';
import { AbiService } from '../apiv2/connection/abi.service';
import { CoinsService } from '../apiv2/connection/coins.service';
import { CoinItem } from 'src/assets/json/coinlist';
import { BlockchainService } from '../apiv2/blockchain/blockchain.service';

@Injectable({
  providedIn: 'root',
})
export class CreateWalletService implements WalletsCreator {
  isPushingMissingWallet = false;
  coins: CoinItem[] = [];
  private readonly GET_ADDRESS_OF = {
    [WalletType.BITCORE_ZCASHY]: this.blockchainService.bitcorelibZcash.getAddress.bind(
      this.blockchainService.bitcorelibZcash,
    ),
    [WalletType.BITCORE_LIB]: this.blockchainService.bitcoreLib.getAddress.bind(
      this.blockchainService.bitcoreLib,
    ),
    [WalletType.BITCORE_CUSTOM]: this.blockchainService.bitcorelibCustom.getAddress.bind(
      this.blockchainService.bitcorelibCustom,
    ),
    [WalletType.ETH]: this.blockchainService.web3.getAddress.bind(this.blockchainService.web3),
    [WalletType.ETH_TOKEN]: this.blockchainService.web3.getAddress.bind(this.blockchainService.web3),
    [WalletType.BSC]: this.blockchainService.web3.getAddress.bind(this.blockchainService.web3),
    [WalletType.BSC_TOKEN]: this.blockchainService.web3.getAddress.bind(this.blockchainService.web3),
    [WalletType.ETC]: this.blockchainService.web3.getAddress.bind(this.blockchainService.web3),
    [WalletType.SOLANA]: this.blockchainService.solana.getAddress.bind(this.blockchainService.solana),
    [WalletType.SOLANA_TOKEN]: this.blockchainService.solana.getAddress.bind(
      this.blockchainService.solana,
    ),
    [WalletType.SOLANA_DEV]: this.blockchainService.solana.getAddress.bind(this.blockchainService.solana),
    [WalletType.SOLANA_TOKEN_DEV]: this.blockchainService.solana.getAddress.bind(
      this.blockchainService.solana,
    ),
    [WalletType.SAFE]: this.blockchainService.safecoin.getAddress.bind(this.blockchainService.safecoin),
    [WalletType.SAFE_TOKEN]: this.blockchainService.safecoin.getAddress.bind(
      this.blockchainService.safecoin,
    ),
    [WalletType.POLKADOT]: this.blockchainService.polkadot.getAddress.bind(
      this.blockchainService.polkadot,
    ),
  };

  constructor(
    private io: IoService,
    private authProvider: AuthenticationProvider,
    private walletsProvider: WalletsProvider,
    private blockchainService: BlockchainService,
    private coinsService: CoinsService,
    private abiService: AbiService,
    private walletService: WalletService,
  ) {}

  get pushingWalletStatus() {
    return this.isPushingMissingWallet;
  }

  setPushingMissingWallet(value: boolean) {
    this.isPushingMissingWallet = value;
  }

  async createWallet(walletData: WalletData): Promise<Wallet> {
    let mnemo;
    const mRaw = walletData.value().mnemo;
    const derive = getCoinDerive(walletData.value().ticker, walletData.value().type);
    const msed = this.walletsProvider.masterSeedValue;
    const acc = this.authProvider.accountValue;

    try {
      if (walletData.value().mnemo !== undefined || walletData.value().mnemo !== '') {
        mnemo = this.io.encrypt(walletData.value().mnemo, acc.idt);
      } else {
        mnemo = this.io.encrypt(msed.sed, acc.idt);
      }

      const c = this.coinsService
        .getCoins()
        .find(e => e.ticker === walletData.value().ticker && e.type === walletData.value().type);
      let abi;
      if (c?.contractAddress) {
        walletData.setContractAddress(c.contractAddress);
      }

      if (Utils.isErcToken(walletData.value().type)) {
        abi = {
          contractaddress: c?.contractAddress || walletData.value().contractaddress,
          type: walletData.value().type,
          abi: await this.abiService.getAbi({
            ticker: walletData.value().ticker,
            type: walletData.value().type,
            contractAddress: c?.contractAddress || walletData.value().contractaddress,
          }),
        };
        this.io.addAbi(abi);
      }

      if (Utils.isToken(walletData.value().type)) {
        const decimal = await this.blockchainService.getDecimals({
          abi: abi?.abi,
          api: c?.api || walletData.value().api,
          type: walletData.value().type,
          contractAddress: c?.contractAddress || walletData.value().contractaddress,
        });
        walletData.setDecimal(decimal);
      } else {
        const decimal = Utils.getDecimals(
          walletData.value().type,
          walletData.value().ticker,
        );
        walletData.setDecimal(decimal);
      }

      if (!!c) {
        walletData.setUniqueId(c.unique_id);
        if (c.origin) {
          walletData.setOrigin(c.origin);
        }
        if (c.api) {
          walletData.setApi(c.api);
        }
      }

      if (!(Utils.isSolanaToken(walletData.value().type) || Utils.isSafecoinToken(walletData.value().type))) {
        walletData.setIsInitialized(true);
      }
      walletData.setMnemo(mnemo);
    } catch (err) {
      throw err;
    }

    const addW = async walletData => {
      try {
        return await this.addWallet(walletData);
      } catch (err) {
        console.error('Adding wallet has failed', err);
        throw err;
      }
    };

    return this.GET_ADDRESS_OF[walletData.value().type]({
      mnemo: mRaw,
      derive,
      ticker: walletData.value().ticker,
      type: walletData.value().type,
      contractAddress: walletData.value().contractaddress,
      api: walletData.value().api,
      addressType: walletData.value().addressType
    }).then(async data => {
      walletData.pushAddress({
        address: data.address,
        derivePath: derive,
      });
      walletData.setMainAddress(data.address);
      if (isSolanaToken(walletData.value().type) || isSafecoinToken(walletData.value().type)) {
        const tokenAddress = await this.walletService.getTokenAddress({
          type: walletData.value().type,
          contractAddress: walletData.value().contractaddress,
          address: walletData.value().mainAddress,
        });
        walletData.setTokenAddress(tokenAddress.toString());
      }
      return addW(walletData).then(_ =>
        this.walletsProvider.pushWallets(this.io.getWallets(walletData.value()._uuid)),
      );
    });
  }

  addWallet(wallet: WalletData): Promise<Wallet> {
    console.log('Adding wallet', wallet);
    const w = wallet.value();
    return Promise.all([this.io.addWallet(w)]).then(([w]) => {
      this.walletsProvider.pushNewWallet(w);
      return w;
    });
  }
}
