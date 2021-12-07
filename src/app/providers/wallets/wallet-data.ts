import { WalletAddress, WalletType, Wallet, AddressType } from 'src/app/interface/data';
import { Acc } from 'src/app/interface/user';
import { datedUUID } from 'src/app/services/utils.service';

export class WalletData {
  private _position = 0;
  private _uuid = datedUUID();
  private _name = '';
  private _type = WalletType.UNKNOWN;
  private _mnemo = '';
  private _ticker = '';
  private _mainAddress = '';
  private _tokenAddress = '';
  private _isActive = true;
  private _api = '';
  private _lastBlock = 0;
  private _lastTx = '';
  private _contractAddress = '';
  private _addresses: WalletAddress[] = [];
  private _decimal = 0;
  private _origin = '';
  private _isInitialized = false;
  private _uniqueId = 0;
  private _addressType = AddressType.HD;

  constructor(private _account: Acc) {}

  static positioner(wallets: Wallet[]): number {
    return wallets.reduce((acc, curr) => (curr._p > acc ? curr._p : acc), 0) + 1;
  }

  value(): Wallet {
    return {
      _p: this._position,
      _uuid: this._uuid,
      uid: this._account.uid,
      name: this._name,
      type: this._type,
      ticker: this._ticker,
      balance: 0,
      isActive: this._isActive,
      mnemo: this._mnemo,
      unconfirmed: 0,
      isRescanning: false,
      addresses: this._addresses,
      mainAddress: this._mainAddress,
      tokenAddress: this._tokenAddress,
      lastblock: this._lastBlock,
      api: this._api,
      lasttx: this._lastTx,
      contractaddress: this._contractAddress,
      decimal: this._decimal,
      origin: this._origin,
      isInitialized: this._isInitialized,
      uniqueId: this._uniqueId,
      addressType: this._addressType
    };
  }

  setName(name: string): this {
    this._name = name;
    return this;
  }

  setType(type: WalletType): this {
    this._type = type;
    return this;
  }

  setMnemo(mnemo: string): this {
    this._mnemo = mnemo;
    return this;
  }

  setTicker(ticker: string): this {
    this._ticker = ticker;
    return this;
  }

  setMainAddress(addr: string): this {
    this._mainAddress = addr;
    return this;
  }

  setTokenAddress(addr: string): this {
    this._tokenAddress = addr;
    return this;
  }

  setContractAddress(addr: string): this {
    this._contractAddress = addr;
    return this;
  }

  setAddressType(addrType: AddressType): this {
    this._addressType = addrType;
    return this;
  }

  setApi(api: string): this {
    this._api = api;
    return this;
  }

  setOrigin(origin: string): this {
    this._origin = origin;
    return this;
  }

  setDecimal(decimal: number): this {
    this._decimal = decimal;
    return this;
  }

  setUniqueId(id: number): this {
    this._uniqueId = id;
    return this;
  }

  setIsInitialized(val: boolean): this {
    this._isInitialized = val;
    return this;
  }

  setWalletType(type: WalletType): this {
    this._type = type;
    return this;
  }

  pushAddress(address: Partial<WalletAddress>): this {
    const addr: WalletAddress = {
      _uuid: this._uuid,
      address: '',
      balance: 0,
      derivePath: '',
      ...address,
    };
    this._addresses.push(addr);
    return this;
  }

  setPositionIn(wallets: Wallet[]): this {
    this._position = WalletData.positioner(wallets);
    return this;
  }

  setPosition(position: number): this {
    this._position = position;
    return this;
  }
}
