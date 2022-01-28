import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { skipWhile, tap } from 'rxjs/operators';
import { Wallet, WalletType } from 'src/app/interface/data';
import { UUID } from 'src/app/interface/global';
import { AuthenticationProvider } from 'src/app/providers/data/authentication.provider';
import { TransactionsProvider } from 'src/app/providers/data/transactions.provider';
import {
  TransactionData,
  TransactionDataErrorHandler,
  TransactionDataResponse,
  TransactionDataSuccessHandler,
  TransactionDataSuccessHandlerMultiple,
  TransactionsService,
} from 'src/app/services/transactions.service';
import { IoService } from '../io.service';
import { isToken, UtilsService } from '../utils.service';
import Bottleneck from 'bottleneck';

type CheckTransactionData = {
  wallets: Wallet[];
  important?: boolean;
};

@Injectable({
  providedIn: 'root',
})
export class CheckWalletsService {
  constructor(
    private tx: TransactionsService,
    private txs: TransactionsProvider,
    private authProvider: AuthenticationProvider,
    private io: IoService,
  ) {
    this._isChecking.next(false);
    this._subscription.add(this.account$.subscribe());
  }
  private transactionErrors: Map<string, string[]> = new Map();
  private _isChecking = new BehaviorSubject<boolean>(false);
  private _subscription = new Subscription();
  private _bottkeneck = new Bottleneck({
    minTime: 333,
  });
  isChecking$ = this._isChecking.asObservable();
  checkingList: UUID[] = [];

  account$ = this.authProvider.account$.pipe(
    skipWhile(v => !v),
    tap(acc => {
      if (!!acc) {
        const wallets = this.io.getWallets(acc.uid);
        const self = this;
        this.tx.subscribleSolChange(wallets, (accountInfo, address) => {
          const w = wallets.filter(e => e.mainAddress === address);
          if (!!w.length) {
            self.checkTransactionsAll({
              wallets: w,
            });
          }
        });
      }
    }),
  );

  checkProperties = data => {
    let notHasOwnProperty = true;
    UtilsService.txsProperties.forEach(element => {
      if (data.data.hasOwnProperty(element) && data.data[element].length === 0) {
        return true;
      } else if (data.data.hasOwnProperty(element)) {
        notHasOwnProperty = false;
      }
    });
    return notHasOwnProperty;
  };

  checkTransactions(data: Partial<CheckTransactionData>, onDone = () => {}) {
    const d: CheckTransactionData = {
      wallets: [],
      ...data,
    };

    d.wallets = d.wallets.filter(e => !this.checkingList.includes(e._uuid));

    if (!!d.wallets.length && !this.checkingList.length) {
      this._isChecking.next(true);
    }

    this.checkingList = this.checkingList.concat(
      d.wallets.reduce((addrs, { _uuid }) => {
        addrs.push(_uuid);
        return addrs;
      }, []),
    );
    // console.log('Get transaction data for', d.wallets);

    const onError: TransactionDataErrorHandler = err => {
      const [uuid, msg] = err.message.split('/');
      // console.log("Failed get transaction", uuid);
      const errs = this.transactionErrors.get(uuid);

      this.checkingDone(uuid, []);

      if (errs) this.transactionErrors.set(uuid, [msg, ...errs]);
      else this.transactionErrors.set(uuid, [msg]);
    };

    const onSuccess: TransactionDataSuccessHandler = res => {
      this.txs.pushTransactions(res);
    };

    const proms = d.wallets.map(wallet => {
      const lastBlock = wallet.lastblock ? wallet.lastblock : 0;
      let contractAddress;
      const { idt } = this.authProvider.accountValue;

      if (UtilsService.isSolanaToken(wallet.type) || UtilsService.isErcToken(wallet.type)) {
        contractAddress = wallet.contractaddress;
      }
      return this._bottkeneck.schedule(() =>
        this.tx
          .getTransactionOfAsync({
            _uuid: wallet._uuid,
            ticker: wallet.ticker,
            type: wallet.type,
            addresses: wallet.addresses.map(a => a.address),
            tokenAddress: wallet.tokenAddress,
            lastBlock,
            api: wallet.api,
            tokenId: contractAddress,
            seeds: this.io.decrypt(wallet.mnemo, idt),
            wallet,
            important: data.important,
          })
          .then(res => onSuccess(res))
          .catch(onError),
      );
    });

    Promise.all(proms).catch(onError).then(onDone);
  }

  checkTransactionsAll(data: Partial<CheckTransactionData>, onDone = () => {}) {
    const d: CheckTransactionData = {
      wallets: [],
      ...data,
    };

    d.wallets = d.wallets.filter(e => !this.checkingList.includes(e._uuid));

    if (!!d.wallets.length && !this.checkingList.length) {
      this._isChecking.next(true);
    }

    this.checkingList = this.checkingList.concat(
      d.wallets.reduce((addrs, { _uuid }) => {
        addrs.push(_uuid);
        return addrs;
      }, []),
    );
    // console.log('Get transaction data for', d.wallets);

    const onError: TransactionDataErrorHandler = err => {
      const [uuid, msg] = err.message.split('/');
      // console.log("Failed get transaction", uuid);
      const errs = this.transactionErrors.get(uuid);

      this.checkingDone(uuid, []);

      if (errs) this.transactionErrors.set(uuid, [msg, ...errs]);
      else this.transactionErrors.set(uuid, [msg]);
    };

    const onSuccess: TransactionDataSuccessHandler = res => {
      this.txs.pushTransactions(res);
    };

    const onSuccessMultiple: TransactionDataSuccessHandlerMultiple = (
      ress: TransactionDataResponse[],
    ) => {
      ress.forEach(res => {
        // if there's at least a transaction
        // if no transaction less than 30 days, we skip
        if (
          res.data.length > 0 ||
          (res.data.length === 0 && res.wallet.lastblock > res.startBlock)
        ) {
          this.txs.pushTransactions(res);
        } else {
          const wallet = res.wallet;
          return this._bottkeneck.schedule(() =>
            this.tx
              .getTransactionOfAsync({
                _uuid: wallet._uuid,
                ticker: wallet.ticker,
                type: wallet.type,
                addresses: wallet.addresses.map(a => a.address),
                tokenAddress: wallet.tokenAddress,
                lastBlock: 0,
                api: wallet.api,
                tokenId: wallet.contractaddress,
                seeds: this.io.decrypt(wallet.mnemo, idt),
                wallet,
                important: data.important,
              })
              .then(res => onSuccess(res))
              .catch(onError),
          );
        }
      });
    };

    const { idt } = this.authProvider.accountValue;
    const independence = d.wallets.filter(e => !isToken(e.type));
    const ercTokens = d.wallets.filter(e => e.type === WalletType.ETH_TOKEN);
    const bscTokens = d.wallets.filter(e => e.type === WalletType.BSC_TOKEN);
    const solanaTokens = d.wallets.filter(e => e.type === WalletType.SOLANA_TOKEN);
    const solanaDevTokens = d.wallets.filter(e => e.type === WalletType.SOLANA_TOKEN_DEV);

    const proms = independence.map(wallet => {
      const lastBlock = wallet.lastblock ? wallet.lastblock : 0;
      let contractAddress;
      if (UtilsService.isSolanaToken(wallet.type) || UtilsService.isErcToken(wallet.type)) {
        contractAddress = wallet.contractaddress;
      }
      return this._bottkeneck.schedule(() =>
        this.tx
          .getTransactionOfAsync({
            _uuid: wallet._uuid,
            ticker: wallet.ticker,
            type: wallet.type,
            addresses: wallet.addresses.map(a => a.address),
            tokenAddress: wallet.tokenAddress,
            lastBlock,
            api: wallet.api,
            tokenId: contractAddress,
            seeds: this.io.decrypt(wallet.mnemo, idt),
            wallet: wallet,
            important: data.important,
          })
          .then(res => onSuccess(res))
          .catch(onError),
      );
    });

    if (ercTokens.length > 0) {
      const ercData: TransactionData[] = [];
      ercTokens.forEach(wallet => {
        const lastBlock = wallet.lastblock ? wallet.lastblock : 0;
        ercData.push({
          _uuid: wallet._uuid,
          ticker: wallet.ticker,
          type: wallet.type,
          addresses: wallet.addresses.map(a => a.address),
          tokenAddress: wallet.tokenAddress,
          lastBlock,
          api: wallet.api,
          tokenId: wallet.contractaddress,
          seeds: this.io.decrypt(wallet.mnemo, idt),
          wallet,
        });
      });
      proms.push(
        this.tx
          .getTransactionMultipleOfAsync(ercData)
          .then(res => onSuccessMultiple(res))
          .catch(onError),
      );
    }

    if (bscTokens.length > 0) {
      const bscData: TransactionData[] = [];
      bscTokens.forEach(wallet => {
        const lastBlock = wallet.lastblock ? wallet.lastblock : 0;
        bscData.push({
          _uuid: wallet._uuid,
          ticker: wallet.ticker,
          type: wallet.type,
          addresses: wallet.addresses.map(a => a.address),
          tokenAddress: wallet.tokenAddress,
          lastBlock,
          api: wallet.api,
          tokenId: wallet.contractaddress,
          seeds: this.io.decrypt(wallet.mnemo, idt),
          wallet,
        });
      });
      proms.push(
        this.tx
          .getTransactionMultipleOfAsync(bscData)
          .then(res => onSuccessMultiple(res))
          .catch(onError),
      );
    }

    if (solanaTokens.length > 0) {
      const splData: TransactionData[] = [];
      solanaTokens.forEach(wallet => {
        splData.push({
          _uuid: wallet._uuid,
          ticker: wallet.ticker,
          type: wallet.type,
          addresses: wallet.addresses.map(a => a.address),
          tokenAddress: wallet.tokenAddress,
          api: wallet.api,
          tokenId: wallet.contractaddress,
          seeds: this.io.decrypt(wallet.mnemo, idt),
          wallet,
          important: data.important,
        });
      });
      proms.push(
        this.tx
          .getTransactionMultipleOfAsync(splData)
          .then(res => onSuccessMultiple(res))
          .catch(onError),
      );
    }

    if (solanaDevTokens.length > 0) {
      const splData: TransactionData[] = [];
      solanaDevTokens.forEach(wallet => {
        splData.push({
          _uuid: wallet._uuid,
          ticker: wallet.ticker,
          type: wallet.type,
          addresses: wallet.addresses.map(a => a.address),
          tokenAddress: wallet.tokenAddress,
          api: wallet.api,
          tokenId: wallet.contractaddress,
          seeds: this.io.decrypt(wallet.mnemo, idt),
          wallet,
          important: data.important,
        });
      });
      proms.push(
        this.tx
          .getTransactionMultipleOfAsync(splData)
          .then(res => onSuccessMultiple(res))
          .catch(onError),
      );
    }
    this._bottkeneck.schedule(() => {
      return Promise.all(proms).catch(onError).then(onDone);
    });
  }

  checkNewTransactions(wallet: Wallet) {
    let count = 0;
    const onError: TransactionDataErrorHandler = err => {
      retry(this, onSuccess, onError);
    };

    const onSuccess: TransactionDataSuccessHandler = res => {
      this.txs.pushTransactions(res);
    };

    const lastBlock = wallet.lastblock ? wallet.lastblock : 0;
    let contractAddress;
    const { idt } = this.authProvider.accountValue;

    if (UtilsService.isSolanaToken(wallet.type) || UtilsService.isErcToken(wallet.type)) {
      contractAddress = wallet.contractaddress;
    }

    getTxs(this, onSuccess, onError);

    function retry(self, onSuccess, onError) {
      if (count < 6) {
        count++;
        setTimeout(() => {
          console.log('Get new tranaction retry', count);
          getTxs(self, onSuccess, onError);
        }, 5000);
      } else {
        console.log('Cannot find new transaction after 5 retries');
      }
    }
    function getTxs(self: CheckWalletsService, onSuccess, onError) {
      return self._bottkeneck.schedule(() =>
        self.tx
          .getTransactionOfAsync({
            _uuid: wallet._uuid,
            ticker: wallet.ticker,
            type: wallet.type,
            addresses: wallet.addresses.map(a => a.address),
            tokenAddress: wallet.tokenAddress,
            lastBlock,
            api: wallet.api,
            tokenId: contractAddress,
            seeds: self.io.decrypt(wallet.mnemo, idt),
            wallet,
          })
          .then(onSuccess)
          .catch(onError),
      );
    }
  }

  checkingDone(uuid: UUID, data) {
    this.checkingList = this.checkingList.filter(e => e !== uuid);
    // console.log('checkingList', uuid, this.checkingList);
    if (!this.checkingList.length) {
      this._isChecking.next(false);
    }
  }
}
