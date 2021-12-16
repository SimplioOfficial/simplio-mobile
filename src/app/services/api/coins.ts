// https://en.bitcoin.it/wiki/List_of_address_prefixes
// Dogecoin BIP32 is a proposed standard: https://bitcointalk.org/index.php?topic=409731
export const coinNames = {
  CUSTOM: 'CUSTOM',

  AAVE: 'AAVE',
  AGLD: 'AGLD',
  AKRO: 'AKRO',
  ALPHA: 'ALPHA',
  ALT: 'ALT',
  AMP: 'AMP',
  ANKR: 'ANKR',
  ANY: 'ANY',
  ATLAS: 'ATLAS',
  ATOM: 'ATOM',
  AUDIO: 'AUDIO',
  AXIS: 'AXIS',
  AXS: 'AXS',
  BADGER: 'BADGER',
  BAKE: 'BAKE',
  BAND: 'BAND',
  BAT: 'BAT',
  BCH: 'BCH',
  BEL: 'BEL',
  BLZ: 'BLZ',
  BNB: 'BNB',
  BNT: 'BNT',
  BNX: 'BNX',
  BRD: 'BRD',
  BSF: 'BSF',
  BTC: 'BTC',
  BTCB: 'BTCB',
  BTCZ: 'BTCZ',
  BTRST: 'BTRST',
  BTT: 'BTT',
  BUSD: 'BUSD',
  BZRX: 'BZRX',
  C98: 'C98',
  CAKE: 'CAKE',
  CEEK: 'CEEK',
  CEL: 'CEL',
  CHESS: 'CHESS',
  CHSB: 'CHSB',
  CHZ: 'CHZ',
  COBAN: 'COBAN',
  COCOS: 'COCOS',
  COMP: 'COMP',
  COPE: 'COPE',
  COTI: 'COTI',
  CRO: 'CRO',
  CRP: 'CRP',
  CRV: 'CRV',
  CTK: 'CTK',
  CTSI: 'CTSI',
  CYS: 'CYS',
  DAI: 'DAI',
  DAR: 'DAR',
  DASH: 'DASH',
  DGB: 'DGB',
  DODO: 'DODO',
  DOGE: 'DOGE',
  DOT: 'DOT',
  DXL: 'DXL',
  DYDX: 'DYDX',
  ELON: 'ELON',
  ENJ: 'ENJ',
  ENS: 'ENS',
  ETC: 'ETC',
  ETH: 'ETH',
  EXRD: 'EXRD',
  FEI: 'FEI',
  FET: 'FET',
  FIDA: 'FIDA',
  FLUX: 'FLUX',
  FRONT: 'FRONT',
  FTT: 'FTT',
  GALA: 'GALA',
  GNO: 'GNO',
  GRAPE: 'GRAPE',
  GRT: 'GRT',
  HOT: 'HOT',
  HT: 'HT',
  HUSD: 'HUSD',
  HXRO: 'HXRO',
  IDEX: 'IDEX',
  ILV: 'ILV',
  IMX: 'IMX',
  INJ: 'INJ',
  IOTX: 'IOTX',
  JASMY: 'JASMY',
  KCS: 'KCS',
  KEEP: 'KEEP',
  KEY: 'KEY',
  KIN: 'KIN',
  LARIX: 'LARIX',
  LAZIO: 'LAZIO',
  LEO: 'LEO',
  LIKE: 'LIKE',
  LINA: 'LINA',
  LINK: 'LINK',
  LIT: 'LIT',
  LRC: 'LRC',
  LTC: 'LTC',
  LUNA: 'LUNA',
  MANA: 'MANA',
  MAPS: 'MAPS',
  MATIC: 'MATIC',
  MBOX: 'MBOX',
  MDT: 'MDT',
  MDX: 'MDX',
  MEDIA: 'MEDIA',
  MER: 'MER',
  MFT: 'MFT',
  MITH: 'MITH',
  MKR: 'MKR',
  MNGO: 'MNGO',
  MTL: 'MTL',
  NEXO: 'NEXO',
  NU: 'NU',
  OCEAN: 'OCEAN',
  OKB: 'OKB',
  ORCA: 'ORCA',
  OXT: 'OXT',
  OXY: 'OXY',
  PAI: 'PAI',
  PAXG: 'PAXG',
  PERP: 'PERP',
  PLA: 'PLA',
  PNT: 'PNT',
  POLS: 'POLS',
  POND: 'POND',
  PORTO: 'PORTO',
  POWR: 'POWR',
  PROM: 'PROM',
  PYR: 'PYR',
  QNT: 'QNT',
  RAD: 'RAD',
  RAMP: 'RAMP',
  RAY: 'RAY',
  REN: 'REN',
  RENBTC: 'RENBTC',
  REQ: 'REQ',
  REV: 'REV',
  RLC: 'RLC',
  RLY: 'RLY',
  RNDR: 'RNDR',
  RSR: 'RSR',
  SAND: 'SAND',
  SANTOS: 'SANTOS',
  SBR: 'SBR',
  SHIB: 'SHIB',
  SFP: 'SFP',
  SIO: 'SIO',
  SKL: 'SKL',
  SLIM: 'SLIM',
  SLP: 'SLP',
  SLRS: 'SLRS',
  SNX: 'SNX',
  SNY: 'SNY',
  SOL: 'SOL',
  SOLR: 'SOLR',
  SOUL: 'SOUL',
  SOL1: 'SOL1', // must be deleted in 0.4.0
  SRM: 'SRM',
  SUSHI: 'SUSHI',
  TEL: 'TEL',
  TLM: 'TLM',
  TRX: 'TRX',
  TTT: 'TTT',
  TULIP: 'TULIP',
  TUSD: 'TUSD',
  TVK: 'TVK',
  UBT: 'UBT',
  UMA: 'UMA',
  UNI: 'UNI',
  USDC: 'USDC',
  USDN: 'USDN',
  USDP: 'USDP',
  USDT: 'USDT',
  VGX: 'VGX',
  VITE: 'VITE',
  WBTC: 'WBTC',
  WILD: 'WILD',
  WIN: 'WIN',
  WRX: 'WRX',
  YFI: 'YFI',
  YGG: 'YGG',
  YOOSHI: 'YOOSHI',
  ZEC: 'ZEC',
  ZER: 'ZER',
  ZRX: 'ZRX',

  BTG: 'BTG',
  ZEN: 'ZEN',

  BSC: 'BSC',
};

export const platformList = {
  ETH: 'ETH',
  BSC: 'BSC',
  SOL: 'SOL',
};

export const coinOrigin = {
  Native: 'Native',
  Sollet: 'Sollet',
  Wormhole: 'Wormhole',
};

export const coinListBitcore = [
  {
    name: 'bitcoin livenet',
    alias: 'mainnet',
    pubkeyhash: 0x00,
    privatekey: 0x80,
    scripthash: 0x05,
    bech32prefix: 'bc',
    xpubkey: 0x0488b21e,
    xprivkey: 0x0488ade4,
    networkMagic: 0xf9beb4d9,
    port: 8333,
    dnsSeeds: [
      'seed.bitcoin.sipa.be',
      'dnsseed.bluematt.me',
      'dnsseed.bitcoin.dashjr.org',
      'seed.bitcoinstats.com',
      'seed.bitnodes.io',
      'bitseed.xf2.org',
    ],
    ticker: coinNames.BTC,
  },
  {
    name: 'litecoin livenet',
    alias: 'mainnet',
    pubkeyhash: 0x30, // PUBKEY_ADDRESS
    privatekey: 0xb0, // SECRET_KEY
    scripthash: 0x32, // SCRIPT_ADDRESS
    bech32prefix: 'ltc',
    xpubkey: 0x0488b21e, // EXT_PUBLIC_KEY
    xprivkey: 0x0488ade4, // EXT_SECRET_KEY
    networkMagic: 0xfbc0b6db,
    port: 9333,
    dnsSeeds: [],
    ticker: coinNames.LTC,
  },
  {
    name: 'digibyte livenet',
    alias: 'mainnet',
    pubkeyhash: 0x1e, // PUBKEY_ADDRESS
    privatekey: 0x80, // SECRET_KEY
    scripthash: 0x3f, // SCRIPT_ADDRESS
    bech32prefix: 'dgb',
    xpubkey: 0x0488b21e, // EXT_PUBLIC_KEY
    xprivkey: 0x0488ade4, // EXT_SECRET_KEY
    networkMagic: 0xfac3b6da,
    port: 12024,
    dnsSeeds: [],
    ticker: coinNames.DGB,
  },
  {
    name: 'doge livenet',
    alias: 'mainnet',
    pubkeyhash: 0x1e, // PUBKEY_ADDRESS
    privatekey: 0x9e, // SECRET_KEY
    scripthash: 0x16, // SCRIPT_ADDRESS
    bech32prefix: 'dgb',
    xpubkey: 0x02facafd, // EXT_PUBLIC_KEY
    xprivkey: 0x02fac398, // EXT_SECRET_KEY
    networkMagic: 0xc0c0c0c0,
    port: 22556,
    dnsSeeds: [],
    ticker: coinNames.DOGE,
  },
];

export const coinListZcashy = [
  {
    messagePrefix: '\x18ZCash Signed Message:\n',
    bech32: 'bc',
    name: 'zcash livenet',
    alias: 'mainnet',
    bip32: {
      public: 0x0488b21e,
      private: 0x0488ade4,
    },
    pubKeyHash: 0x1cb8,
    scriptHash: 0x1cbd,
    wif: 0x80,
    // This parameter was introduced in version 3 to allow soft forks, for version 1 and 2 transactions we add a
    // dummy value.
    consensusBranchId: {
      1: 0x00,
      2: 0x00,
      3: 0x5ba81b19,
      4: 0xe9ff75a6,
    },
    ticker: coinNames.ZEC,
  },
  {
    messagePrefix: '\x18BitcoinZ Signed Message:\n',
    bech32: 'bc',
    name: 'bitcoinz livenet',
    alias: 'mainnet',
    pubKeyHash: 0x1cb8,
    wif: 0x80,
    scriptHash: 0x1cbd,
    bip32: {
      public: 0x0488b21e,
      private: 0x0488ade4,
    },
    zaddr: 0x169a,
    zkey: 0xab36,
    networkMagic: 0x24e92764,
    port: 1989,
    consensusBranchId: {
      1: 0x00,
      2: 0x00,
      3: 0x5ba81b19,
      4: 0x76b809bb,
    },
    dnsSeeds: ['seed.btcz.life'],
    ticker: coinNames.BTCZ,
  },
  {
    messagePrefix: '\x18Flux Signed Message:\n',
    bech32: 'bc',
    name: 'flux livenet',
    alias: 'mainnet',
    bip32: {
      public: 0x0488b21e,
      private: 0x0488ade4,
    },
    pubKeyHash: 0x1cb8,
    scriptHash: 0x1cbd,
    wif: 0x80,
    // This parameter was introduced in version 3 to allow soft forks, for version 1 and 2 transactions we add a
    // dummy value.
    consensusBranchId: {
      1: 0x00,
      2: 0x00,
      3: 0x5ba81b19,
      4: 0x76b809bb,
    },
    ticker: coinNames.FLUX,
  },
  {
    messagePrefix: '',
    name: 'zero livenet',
    bip32: {
      public: 0x0488b21e,
      private: 0x0488ade4,
    },
    pubKeyHash: 0x1cb8,
    scriptHash: 0x1cbd,
    wif: 0x80,
    consensusBranchId: {
      1: 0x00,
      2: 0x00,
      3: 0x5ba81b19,
      4: 0x7361707a,
    },
    ticker: coinNames.ZER,
  },
  {
    messagePrefix: '',
    name: 'Horizen livenet',
    bip32: {
      public: 0x0488b21e,
      private: 0x0488ade4,
    },
    pubKeyHash: 0x2089,
    scriptHash: 0x2096,
    wif: 0x80,
    consensusBranchId: {
      1: 0x00,
      2: 0x00,
      3: 0x5ba81b19,
      4: 0x7361707a,
    },
    ticker: coinNames.ZEN,
  },
];
