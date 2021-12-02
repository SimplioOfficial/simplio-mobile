import { Injectable, isDevMode } from '@angular/core';

import { isUndefined, isNull, isError, isObject, find, filter } from 'lodash';

@Injectable()
export class Logger {
  levels;
  weight;
  logs;

  constructor() {
    this.logs = [];
    this.levels = [
      { level: 'error', weight: 1, label: 'Error', def: false },
      { level: 'warn', weight: 2, label: 'Warning', def: false },
      { level: 'info', weight: 3, label: 'Info', def: true },
      { level: 'debug', weight: 4, label: 'Debug', def: false },
    ];

    // Create an array of level weights for performant filtering.
    this.weight = {};
    for (const item of this.levels) {
      this.weight[item.level] = item.weight;
    }
  }

  private getMessage(message): string {
    if (isUndefined(message)) {
      return 'undefined';
    } else if (isNull(message)) {
      return 'null';
    } else if (isError(message)) {
      return message.message;
    } else if (isObject(message)) {
      return JSON.stringify(message);
    } else {
      return message;
    }
  }

  error(message?, ...optionalParams): void {
    const type = 'error';
    const args = this.processingArgs(arguments);
    this.log(`[${type}] ${args}`);
    this.add(type, args);
    console.log(new Error('Whoops!'));
  }

  debug(message?, ...optionalParams): void {
    const type = 'debug';
    const args = this.processingArgs(arguments);
    if (isDevMode()) {
      this.log(`[${type}] ${args}`);
    }
    this.add(type, args);
  }

  info(message?, ...optionalParams): void {
    const type = 'info';
    const args = this.processingArgs(arguments);
    if (isDevMode()) {
      this.log(`[${type}] ${args}`);
    }
    this.add(type, args);
  }

  warn(message?, ...optionalParams): void {
    const type = 'warn';
    const args = this.processingArgs(arguments);
    if (isDevMode()) {
      this.log(`[${type}] ${args}`);
    }
    this.add(type, args);
  }

  getLevels() {
    return this.levels;
  }

  getWeight(weight) {
    return find(this.levels, l => {
      return l.weight === weight;
    });
  }

  getDefaultWeight() {
    return find(this.levels, l => {
      return l.def;
    });
  }

  add(level, msg): void {
    msg = msg.replace('/xpriv.*/', '[...]');
    msg = msg.replace('/walletPrivKey.*/', 'walletPrivKey:[...]');
    const newLog = {
      timestamp: new Date().toISOString(),
      level,
      msg,
    };
    this.logs.push(newLog);
  }

  /**
   * Returns logs of <= to filteredWeight
   * @param filteredWeight Weight (1-4) to use when filtering logs. optional
   */
  get(filterWeight?: number) {
    let filteredLogs = this.logs;
    if (filterWeight !== undefined) {
      filteredLogs = filter(this.logs, l => {
        return this.weight[l.level] <= filterWeight;
      });
    }
    return filteredLogs;
  }

  processingArgs(argsValues) {
    let args = Array.prototype.slice.call(argsValues);
    args = args.map(v => {
      try {
        v = this.getMessage(v);
      } catch (e) {
        console.log('Error at log decorator:', e);
        v = 'Unknown message';
      }
      return v;
    });
    return args.join(' ');
  }

  log(msg: string, ...optionalParams) {
    console.log(msg, ...optionalParams);
  }
}
