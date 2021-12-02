/// <reference lib="webworker" />

import { connect, SWAP_URL, Connection, Events } from 'src/shared/swap.websockets';
import { SwapConnectionReport } from '../interface/swap';

export type Message<T> = {
  event: Events;
  data: T;
};

const message = <T>(message: Message<T>) => postMessage(message);

let connection: Connection;
const genericError = new Error('Connection failed');

const spawnConnection = (token: string, cb: (con: Connection) => void) => {
  try {
    connection = connect(SWAP_URL, {
      accessTokenFactory: () => token,
    });

    connection.on(Events.UPDATE_SWAP_REPORT, (data: SwapConnectionReport) =>
      message({
        event: Events.UPDATE_SWAP_REPORT,
        data,
      }),
    );

    connection.onclose(err => onError(connection, err));

    cb(connection);
  } catch (error) {
    console.error(error);
  }
};
const closeConnection = (cb: () => void) => {
  connection?.stop();
  cb();
};

addEventListener('message', message => {
  console.log('Socket message', message);
  const { data } = message;
  const action: string =
    data.action && typeof data.action === 'string' ? data.action.toUpperCase() : '';

  switch (action) {
    case 'SPAWN':
      return spawnConnection(data.token, start);
    case 'CLOSE':
      return closeConnection(close);
    default:
      return close();
  }
});

async function start(conn: Connection, repeat = 5): Promise<Connection> {
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
}

async function onError(conn: Connection, err: Error = genericError) {
  message({
    event: Events.CONNECTION_TERMINATED,
    data: 'Terminated',
  });
}
