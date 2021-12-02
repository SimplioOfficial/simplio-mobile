import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SwapReportItem } from 'src/app/interface/swap';
import { AuthenticationProvider } from 'src/app/providers/data/authentication.provider';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { SwapProvider } from 'src/app/providers/data/swap.provider';
import { Message } from 'src/app/workers/pending-swap.worker';
import { connect, Connection, Events, SWAP_URL } from 'src/shared/swap.websockets';
import { environment } from 'src/environments/environment';

export type ConnectionOptions = {
  token: string | null;
};

const genericError = new Error('Connection failed');
@Injectable({
  providedIn: 'root',
})
export class SwapConnectionService {
  constructor(
    private swapProvider: SwapProvider,
    private authProvider: AuthenticationProvider,
    private authService: AuthenticationService,
  ) {
    // this._subscription.add(this.account$.subscribe());
  }

  workerConnection: Worker | null = null;
  localConnection: Connection;
  private _connected = new BehaviorSubject<boolean>(false);
  connected$ = this._connected.asObservable();

  isClosed = false;
  token;

  get isConnected(): boolean {
    return this._connected.value;
  }

  spawnConnectionsWorker(options: ConnectionOptions = { token: null }): Worker {
    if (!!this.workerConnection) {
      if (options.token !== this.token) {
        this.token = options.token;
        this.workerConnection.postMessage({
          action: 'SPAWN',
          token: options.token,
        });
      }
      return this.workerConnection;
    }

    try {
      this.token = options.token;
      this.workerConnection = new Worker(
        new URL('../../workers/pending-swap.worker', import.meta.url),
        {
          type: 'module',
          name: 'notifier',
        },
      );

      function refreshToken(self: SwapConnectionService) {
        if (self.authProvider.accountValue) {
          self.authService
            .refresh(self.authProvider.accountValue)
            .then(acc => self.spawnConnectionsWorker({ token: acc.atk }))
            .catch(_ => setTimeout(_ => refreshToken(self), 15000));
        } else {
          console.log(
            "Main server is not responsing, you're running on backup server for logging in only, skip worker",
          );
        }
      }

      this.workerConnection.onmessage = data => {
        console.log('Swap worker message', data);
        const message: Message<any> = data.data;
        switch (message.event) {
          case Events.UPDATE_SWAP_REPORT:
            return this.swapProvider.updatePending(message.data as SwapReportItem);
          case Events.CONNECTION_TERMINATED:
            console.log('WS connection is terminated');
            return refreshToken(this);
          default:
            console.error('Unknown event:' + message);
        }
      };

      this.workerConnection.onmessageerror = console.error;

      this.workerConnection.postMessage({
        action: 'SPAWN',
        token: options.token,
      });

      this._connected.next(true);
      return this.workerConnection;
    } catch (err) {
      console.error(err);
    }
  }

  startLocalConnection(options: ConnectionOptions = { token: null }): Connection {
    const connection = connect(SWAP_URL, {
      accessTokenFactory: () => options.token,
    });

    const start = (conn: Connection, repeat = 5): Promise<Connection> => {
      return conn
        .start()
        .then(() => {
          console.log('Started swap connection on web worker', conn.connectionId);
          return conn;
        })
        .catch(err => {
          console.error(err);
          if (repeat > 0) return start(conn, repeat - 1);
          else return Promise.reject(onError(conn, err));
        });
    };

    const onError = async (conn: Connection, err: Error = genericError): Promise<Connection> => {
      console.error(err);
      return await start(conn);
    };

    connection.on(Events.UPDATE_SWAP_REPORT, (data: SwapReportItem) =>
      this.swapProvider.updatePending(data),
    );

    connection.onclose(err => onError(connection, err));

    start(connection).then(conn => {
      this.localConnection = conn;
      this._connected.next(true);
    });

    return connection;
  }

  terminateLocalConnection() {
    if (!this.localConnection) return;

    this.localConnection.stop().then(() => {
      this.localConnection = null;
      this._connected.next(false);
    });
  }

  terminateConnectionWorker() {
    if (this.workerConnection) {
      this.workerConnection.postMessage({ action: 'CLOSE' });
      this.workerConnection = null;
      this._connected.next(false);
    }
  }

  start(options: ConnectionOptions) {
    if ('Worker' in window) this.spawnConnectionsWorker(options);
    else this.startLocalConnection(options);
  }

  stop() {
    if ('Worker' in window) this.terminateConnectionWorker();
    else this.terminateLocalConnection();
  }
}
