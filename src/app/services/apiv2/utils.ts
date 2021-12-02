import { WalletType } from 'src/app/interface/data';

export const getCoinDerive = (ticker: string, type: WalletType) => {
  const defaultDerive = "m/44'/<type>'/0'/0/0";
  let numb = 0;

  switch (type) {
    case WalletType.BSC:
    case WalletType.BSC_TOKEN:
      numb = 60;
      break;
    case WalletType.ETC:
      numb = 60;
      break;
    case WalletType.ETH:
    case WalletType.ETH_TOKEN:
      numb = 60;
      break;
    case WalletType.BITCORE_CUSTOM:
    case WalletType.BITCORE_LIB:
    case WalletType.BITCORE_ZCASHY:
      switch (ticker.toLowerCase()) {
        case 'btc':
          numb = 0;
          break;
        case 'ltc':
          numb = 2;
          break;
        case 'dash':
          numb = 5;
          break;
        case 'zec':
        case 'zcash':
          numb = 133;
          break;
        case 'bch':
          numb = 145;
          break;
        case 'btg':
          numb = 156;
          break;
        case 'dgb':
          numb = 20;
          break;
        case 'btcz':
          numb = 177;
          break;
        case 'flux':
          numb = 19167;
          break;
        case 'zer':
          numb = 323;
          break;
        case 'zen':
          numb = 121;
          break;
        case 'doge':
          numb = 3;
          break;
        default:
          numb = 60;
          break;
      }
      break;
    default:
      numb = 60;
      break;
  }
  return defaultDerive.replace('<type>', numb.toString());
};

export const getAbi = abi => {
  let a = abi;
  if (typeof abi === 'string') {
    a = JSON.parse(abi);
  }
  return a;
};
