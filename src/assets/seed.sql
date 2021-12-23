-- DROP TABLE accounts;
-- DROP TABLE externaladdress;
-- DROP TABLE changeaddress;
-- DROP TABLE addresses;
-- DROP TABLE wallets;
-- DROP TABLE caches;
-- DROP TABLE settings;
-- DROP TABLE cachetransactions;
-- DROP TABLE swap;
-- DROP TABLE dbv;
-- DROP TABLE accs; -- Accounts
-- DROP TABLE alog; -- Account Logs
-- DROP TABLE setts; -- Settings
-- DROP TABLE msed; -- Master Seed
-- DROP TABLE wcch; -- Wallet Cache
-- DROP TABLE tcch; -- Transaction Cache
-- CREATE TABLE IF NOT EXISTS accounts(
--   id INTEGER PRIMARY KEY AUTOINCREMENT,
--   _uuid TEXT,
--   email TEXT NOT NULL,
--   checkpassword TEXT NOT NULL,
--   recover TEXT NOT NULL,
--   idt TEXT DEFAULT 'NONE',
--   lvl INTEGER NOT NULL DEFAULT 0,
--   isbackedup BOOLEAN NOT NULL,
--   seeds TEXT NOT NULL DEFAULT ''
--   -- FOREIGN KEY(email) REFERENCES wallets(email)
-- );
-- CREATE TABLE IF NOT EXISTS wallets(
--   id INTEGER PRIMARY KEY AUTOINCREMENT,
--   _p INTEGER NOT NULL,
--   _uuid TEXT NOT NULL,
--   walletid INTEGER,
--   email TEXT NOT NULL,
--   walletname TEXT NOT NULL,
--   wallettype INTEGER NOT NULL,
--   coin text not null,
--   balance REAL not null,
--   unconfirmed REAL not null,
--   mnemo text not null,
--   logo text not null,
--   customlogo text,
--   mainaddress text,
--   derive integer,
--   isbackedup BOOLEAN not null,
--   derivechange integer,
--   lastcreated integer,
--   lastupdatebalance integer,
--   isrescanning boolean,
--   apiurl text,
--   derivationpath text,
--   libtype text
--   -- FOREIGN KEY(walletname) REFERENCES addresses(walletname)
-- );
-- CREATE TABLE IF NOT EXISTS addresses(
--   id INTEGER PRIMARY KEY AUTOINCREMENT,
--   email TEXT NOT NULL,
--   walletname TEXT NOT NULL,
--   derive integer,
--   addr text,
--   balance real,
--   ischange boolean
-- );

-- CREATE TABLE IF NOT EXISTS caches(
--   id INTEGER PRIMARY KEY AUTOINCREMENT,
--   email TEXT NOT NULL,
--   walletname text not null,
--   balance real,
--   unconfirmed real,
--   newtx boolean
-- );
-- CREATE TABLE IF NOT EXISTS cachetransactions(
--   id INTEGER PRIMARY KEY AUTOINCREMENT,
--   _uuid TEXT NOT NULL DEFAULT "",
--   email TEXT NOT NULL,
--   walletname TEXT NOT NULL,
--   addr text not null,
--   txtype integer,
--   coin text,
--   amount real,
--   txhash text,
--   unix integer,
--   txdate text,
--   confirmed boolean,
--   blockconfirmed integer
-- );

-- CREATE TABLE IF NOT EXISTS settings(
--   id INTEGER PRIMARY KEY AUTOINCREMENT,
--   email TEXT NOT NULL,
--   refreshinterval integer,
--   feepolicy text,
--   lang text,
--   alternativecurrency text,
--   primarywallet text,
--   enablegraph boolean,
--   graphperiod text,
--   thememod integer,
--   themeaccent text
-- );

CREATE TABLE IF NOT EXISTS swap(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userid text not null,
  email text not null,
  swapcredential text not null
);

CREATE TABLE IF NOT EXISTS swaptransactions(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email text not null,
  sourcetxid text not null,
  sourcewallet text not null,
  sourcecurrency text not null,
  sourceamount text not null,
  targetwallet text not null,
  targetcurrency text not null,
  targetamount text not null,
  refundaddress text not null,
  targetprice real,
  referenceCode text,
  unixtime integer not null,
  swapstatus integer not null
);

-- Database version
CREATE TABLE IF NOT EXISTS dbv(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ver INTEGER DEFAULT 0
);

-- Account
CREATE TABLE IF NOT EXISTS accs(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  uid TEXT NOT NULL,
  atk TEXT,
  tkt TEXT,
  rtk TEXT,
  idt TEXT NOT NULL,
  lvl INTEGER DEFAULT 0
);

-- Account login log
CREATE TABLE IF NOT EXISTS alog(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uid TEXT NOT NULL,
  idt TEXT NOT NULL,
  lvl INTEGER DEFAULT 0
);

-- Settings
CREATE TABLE IF NOT EXISTS setts(
  uid TEXT NOT NULL,
  refresh INTEGER DEFAULT 30,
  language TEXT NOT NULL,
  currency TEXT NOT NULL,
  feePolicy TEXT NOT NULL,
  primaryWallet TEXT,
  graph_enable INTEGER DEFAULT 0,
  graph_period TEXT,
  theme_mode INTEGER DEFAULT 0,
  theme_accent TEXT DEFAULT 'default'
);

-- Master seed
CREATE TABLE IF NOT EXISTS msed(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uid TEXT NOT NULL,
  sed TEXT NOT NULL,
  bck INTEGER DEFAULT 0
);


-- Wallets
CREATE TABLE IF NOT EXISTS walls(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  _p INTEGER NOT NULL,
  _uuid TEXT NOT NULL,
  uid TEXT NOT NULL,
  wallet_name TEXT NOT NULL,
  wallet_type INTEGER NOT NULL,
  ticker text not null,
  balance REAL not null,
  unconfirmed REAL not null,
  mnemo text not null,
  main_address text,
  token_address text,
  is_active INTEGER DEFAULT 1,
  is_rescanning INTEGER DEFAULT 0,
  last_tx TEXT,
  last_block INTEGER DEFAULT 0,
  wallet_decimal INTEGER,
  contract_address TEXT,
  apiurl text,
  origin TEXT,
  is_initialized INTEGER DEFAULT 1,
  unique_id INTEGER,
  address_type INTEGER DEFAULT 2 -- default HD wallet
);

-- Wallet Addresses
CREATE TABLE IF NOT EXISTS addrs(
  _uuid TEXT NOT NULL,
  derive_path INTEGER,
  addr TEXT,
  balance REAL
);


CREATE TABLE IF NOT EXISTS tuts(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uid TEXT NOT NULL,
  tut_init INTEGER DEFAULT 0
);


CREATE TABLE IF NOT EXISTS abis(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contractaddress TEXT NOT NULL,
  wallet_type INTEGER,
  abi TEXT
);


-- Transaction cache
CREATE TABLE IF NOT EXISTS tcch(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  _uuid TEXT NOT NULL,
  addr TEXT NOT NULL,
  txtype INTEGER,
  ticker TEXT NOT NULL,
  amount REAL,
  txhash TEXT NOT NULL,
  unix INTEGER,
  txdate TEXT NOT NULL,
  confirmed INTEGER DEFAULT 0,
  blockconfirmed INTEGER
);