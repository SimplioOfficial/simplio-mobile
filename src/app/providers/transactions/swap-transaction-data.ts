import { AddrUtxo, FeeItem, GasTx, Wallet, WalletType } from 'src/app/interface/data';
import {
  ITransactionData,
  SwapConvertResponse,
  SingleSwapTransaction,
  SwapPair,
  SwapTransactionParty,
  TxSignature,
} from 'src/app/interface/swap';

export class SwapTransactionData implements ITransactionData<SingleSwapTransaction> {
  private _txid: string = null;
  private _source: SwapTransactionParty = null;
  private _target: SwapTransactionParty = null;
  private _referenceCode = '';
  private _pair: SwapPair = null;
  private _convert: SwapConvertResponse = null;
  private _signature: TxSignature = null;
  private _fee: FeeItem = null;
  private _gas: GasTx = null;
  private _tokenData: string = null;
  private _utxo: AddrUtxo[] = [];
  private _nonce: string = null;

  get txid() {
    return this._txid;
  }

  get type() {
    return this._source?.wallet?.type ?? WalletType.UNKNOWN;
  }

  get source() {
    return this._source;
  }

  get amount(): number {
    return this._convert?.SourceCurrentAmount ?? 0;
  }

  get convert() {
    return this._convert;
  }

  get pair() {
    return this._pair;
  }

  get fee() {
    return this._fee;
  }

  get signedFee() {
    return this._signature?.fee ?? 0;
  }

  get gas() {
    return this._gas;
  }

  get nonce() {
    return this._nonce;
  }

  get utxo() {
    return this._utxo;
  }

  get tokenData() {
    return this._tokenData;
  }

  get rawTx(): string {
    return this._signature?.rawtx ?? '';
  }

  get referenceCode() {
    return this._referenceCode;
  }

  value(): SingleSwapTransaction {
    return {
      sourceTxId: this._txid,
      targetPrice: this._convert.TargetGuaranteedWithdrawalAmount,
      referenceCode: this._referenceCode,
      sourceInitialAmount: this._convert.SourceCurrentAmount,
      userAgreedAmount: this._convert.TargetGuaranteedWithdrawalAmount,
      label1: '',
      label2: '',
      label3: '',
      sourceCurrency: this._source.ticker,
      sourceCurrencyNetwork: this._pair.SourceCurrencyNetwork,
      targetCurrency: this._pair.TargetCurrency,
      targetCurrencyNetwork: this._pair.TargetCurrencyNetwork,
      targetExchangeEndpoint: this._pair.ExchangeEndpoint,
      targetAddress: this._pair.SourceDepositAddress,
      refundAddress: '',
    };
  }

  sign(signature: TxSignature): this {
    this._signature = signature;
    return this;
  }

  setSource(wallet: Wallet): this {
    this._source = {
      wallet,
      address: wallet.mainAddress,
      ticker: wallet.ticker.toUpperCase(),
    };
    return this;
  }

  setTarget(wallet: Wallet): this {
    this._target = {
      wallet,
      address: wallet.mainAddress,
      ticker: wallet.ticker.toUpperCase(),
    };
    return this;
  }

  setSwapPair(swapPair: SwapPair): this {
    this._pair = swapPair;
    return this;
  }

  setConvertResponse(swapResponse: SwapConvertResponse): this {
    this._convert = swapResponse;
    return this;
  }

  setReferenceCode(code: string): this {
    this._referenceCode = code;
    return this;
  }

  setFee(fee: FeeItem): this {
    this._fee = fee;
    return this;
  }

  setGas(gas: GasTx): this {
    this._gas = gas;
    return this;
  }

  setNonce(nonce: string): this {
    this._nonce = nonce;
    return this;
  }

  setUtxo(utxo: AddrUtxo[]): this {
    this._utxo = utxo;
    return this;
  }

  setTokenData(tokenData: string): this {
    this._tokenData = tokenData;
    return this;
  }

  setTxid(txid: string): this {
    this._txid = txid;
    return this;
  }
}
