import { Injectable } from '@angular/core';
import * as backend from '@simplio/backend/api';
import { AddressType, AddrUtxo, Rate, Transaction, TxType, WalletAddress, WalletType } from 'src/app/interface/data';
import { Explorer, ExplorerType } from 'src/app/interface/explorer';
import { TransactionsProvider } from 'src/app/providers/data/transactions.provider';
import { TransactionDataResponse } from '../../transactions.service';
import { isCoin, isErcCoin, isErcToken, isSolana, isSolanaToken, isSafecoin, isSafecoinToken } from '@simplio/backend/utils'
import { NetworkService } from '../connection/network.service';
import { TxblockbookService } from '../transaction/txblockbook.service';
import { TxinsightService } from '../transaction/txinsight.service';
@Injectable({
  providedIn: 'root',
})
export class BackendService {
  private blib: backend.BitcoreLib;
  private blibC: backend.BitcoreLibCustom;
  private blibZ: backend.BitcoreZcashy;
  private sol: backend.Solana;
  private safe: backend.Safecoin;
  private dot: backend.Polkadot;
  private w3: backend.Web3Sio;
  private vAddress: backend.ValidateaddressService;
  private dec: backend.DecimalsService;
  private tx: backend.Createtransaction;

  constructor(
    private networkService: NetworkService,
    private txblockbook: TxblockbookService,
    private txinsight: TxinsightService,
    private txs: TransactionsProvider
  ) {
    this.blib = new backend.BitcoreLib();
    this.blibC = new backend.BitcoreLibCustom();
    this.blibZ = new backend.BitcoreZcashy();
    this.sol = new backend.Solana();
    this.safe = new backend.Safecoin();
    this.dot = new backend.Polkadot();
    this.w3 = new backend.Web3Sio();
    this.vAddress = new backend.ValidateaddressService(
      this.blibZ,
      this.blib,
      this.blibC,
      this.w3,
      this.sol,
      this.safe,
      this.dot,
    );
    this.dec = new backend.DecimalsService(this.sol, this.safe, this.w3);
    this.tx = new backend.Createtransaction(
      this.blibZ,
      this.blib,
      this.blibC,
      this.w3,
      this.sol,
      this.safe,
      this.dot,
    );
  }

  get bitcoreLib() {
    return this.blib;
  }

  get bitcorelibCustom() {
    return this.blibC;
  }

  get bitcorelibZcash() {
    return this.blibZ;
  }

  get solana() {
    return this.sol;
  }

  get safecoin() {
    return this.safe;
  }

  get polkadot() {
    return this.dot;
  }

  get web3() {
    return this.w3;
  }

  get decimals() {
    return this.dec;
  }

  get transaction() {
    return this.tx;
  }

  getLastWeb3Block(type: WalletType): Promise<any> {
      return this.web3.getLib(type).eth.getBlockNumber();
  }

  async createTransaction(data: {
    _uuid: string;
    seeds: string;
    ticker: string;
    addresses: WalletAddress[];
    fee: number;
    receiver: string;
    amount: number;
    explorer: Explorer;
    utxos: AddrUtxo[];
    type: WalletType;
    change: number;
    gasLimit: number;
    gasPrice: number;
    balance: number;
    abi: string;
    contractAddress: string;
    lasttx: string;
    api: string;
    feeContractAddress?: string;
    addressType: AddressType
  }) {
    if (isSolana(data.type) || isSolanaToken(data.type)) {
      data.api = this.getSolApi(data);
    }
    if (isSafecoin(data.type) || isSafecoinToken(data.type)) {
      data.api = this.getSafeApi(data);
    }    
    const txResponse = await this.transaction.createTransaction(data);
    if(isErcToken(data.type) || isErcCoin(data.type)){
      const currBlock = await this.getLastWeb3Block(data.type)
      const tx: Transaction = {
        _uuid: data._uuid,
        address: data.addresses[0].address,
        amount: data.amount,
        block: currBlock,
        confirmed: false,
        date: "",
        unix: Math.floor(Date.now() / 1000),
        hash: txResponse,
        ticker: data.ticker,
        type: TxType.UNKNOWN,
      }

      let txDataResponse: TransactionDataResponse = {
        _uuid: data._uuid,
        data: [tx],
        endBlock: currBlock,
      }
      this.txs.pushTransactions(txDataResponse);
      return txResponse;
    }
    else if (isCoin(data.type)) {
      switch (data.explorer.type) {
        case ExplorerType.BLOCKBOOK:
          return this.txblockbook.broadcastTx({ explorer: data.explorer, rawtx: txResponse });
        case ExplorerType.INSIGHT:
        default:
          return this.txinsight.broadcastTx({ explorer: data.explorer, rawtx: txResponse });
      }
    } else {
      return txResponse;
    }
  }

  validateAddress(data: {
    ticker: string;
    type: WalletType;
    address: string;
    mint: string;
    api: string;
  }) {
    if (isSolana(data.type) || isSolanaToken(data.type)) {
      data.api = this.getSolApi(data);
    }
    if (isSafecoin(data.type) || isSafecoinToken(data.type)) {
      data.api = this.getSafeApi(data);
    }
    return this.vAddress.validateAddress(data);
  }

  getTokenAddress(data: {
    type: WalletType;
    contractAddress: string;
    address: string;
    api?: string;
  }) {
    if (isSolana(data.type) || isSolanaToken(data.type)) {
      data.api = this.getSolApi(data);
    }
    if (isSafecoin(data.type) || isSafecoinToken(data.type)) {
      data.api = this.getSafeApi(data);
    }
    return this.solana.getTokenAddress(data);
  }

  estimatedFee(data: {
    ticker: string;
    type: WalletType;
    ismax: boolean;
    feePrice: number;
    amount: number;
    address: string;
    from: string;
    utxos: AddrUtxo[]; // specify for bitcore lib
    minFee: number;
    abi: string; // for bsc and erc tokens
    contractAddress: string; // for tokens
    rates?: Rate[];
    // for SOL & SOL tokens tokens
    api: string;
    signature: number;
    tokenData?: any;
  }): Promise<any> {
    switch (data.type) {
      case WalletType.BITCORE_ZCASHY:
        if (data.ismax) {
          return this.bitcorelibZcash.estimatedFeeMax(data);
        } else {
          return this.bitcorelibZcash.estimatedFee(data);
        }
      case WalletType.BITCORE_LIB:
        if (data.ismax) {
          return this.bitcoreLib.estimatedFeeMax(data);
        } else {
          return this.bitcoreLib.estimatedFee(data);
        }
      case WalletType.BITCORE_CUSTOM:
        if (data.ismax) {
          return this.bitcorelibCustom.estimatedFeeMax(data);
        } else {
          return this.bitcorelibCustom.estimatedFee(data);
        }
      case WalletType.BSC:
      case WalletType.BSC_TOKEN:
      case WalletType.ETH:
      case WalletType.ETH_TOKEN:
      case WalletType.ETC:
        if (data.ismax) {
          return this.web3.estimatedFeeMax(data);
        } else {
          return this.web3.estimatedFee(data);
        }
      case WalletType.SOLANA:
      case WalletType.SOLANA_TOKEN:
      case WalletType.SOLANA_DEV:
      case WalletType.SOLANA_TOKEN_DEV:
        data.api = this.getSolApi(data);
        if (!data.tokenData || !data.tokenData.ticker) {
          if (data.ismax) {
            return this.solana.estimatedFeeMax(data);
          } else {
            return this.solana.estimatedFee(data);
          }
        } else {
          // only support when sending token, not support swap
          return this.solana.estimatedFeeInToken(data);
        }
      case WalletType.SAFE:
      case WalletType.SAFE_TOKEN:
        data.api = this.getSafeApi(data);
        if (!data.tokenData || !data.tokenData.ticker) {
          if (data.ismax) {
            return this.safecoin.estimatedFeeMax(data);
          } else {
            return this.safecoin.estimatedFee(data);
          }
        } else {
          // only support when sending token, not support swap
          return this.safecoin.estimatedFeeInToken(data);
        }
    }
  }

  getDecimals(data: { type?: WalletType; abi?: any; api?: string; contractAddress: string }) {
    if (isSolana(data.type) || isSolanaToken(data.type)) {
      data.api = this.getSolApi(data);
    }
    if (isSolana(data.type) || isSafecoinToken(data.type)) {
      data.api = this.getSafeApi(data);
    }  
    return this.decimals.getDecimals(data);
  }

  getSolApi(data: { important?: boolean; api?: string }) {
    if (data.api && !!data.api.trim()) {
      return data.api;
    }
    let explorers = this.networkService.getCoinExplorers(undefined, WalletType.SOLANA);
    if (!data.important) {
      function getRandomInt(max) {
        return Math.floor(Math.random() * max);
      }
      explorers = explorers.filter(e => e.priority >= 2);
      while (explorers.length > 0) {
        let rnd = getRandomInt(explorers.length);
        if (explorers[rnd].priority >= 2) {
          return explorers[rnd].api;
        }
      }
    } else {
      const ex = explorers.find(e => e.priority === 1);
      return ex.api;
    }
  }

    getSafeApi(data: { important?: boolean; api?: string }) {
    if (data.api && !!data.api.trim()) {
      return data.api;
    }
    let explorers = this.networkService.getCoinExplorers(undefined, WalletType.SAFE);
    if (!data.important) {
      function getRandomInt(max) {
        return Math.floor(Math.random() * max);
      }
      explorers = explorers.filter(e => e.priority >= 2);
      while (explorers.length > 0) {
        let rnd = getRandomInt(explorers.length);
        if (explorers[rnd].priority >= 2) {
          return explorers[rnd].api;
        }
      }
    } else {
      const ex = explorers.find(e => e.priority === 1);
      return ex.api;
    }
  }

}
