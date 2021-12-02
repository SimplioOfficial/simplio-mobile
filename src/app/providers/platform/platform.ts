import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { Logger } from '../logger/logger';
import { BehaviorSubject } from 'rxjs';
import { Device, DeviceId, DeviceInfo } from '@capacitor/device';

@Injectable()
export class PlatformProvider {
  isAndroid: boolean;
  isIOS: boolean;
  isSafari: boolean;
  isCordova: boolean;
  isElectron: boolean;
  ua: string;
  isMobile: boolean;
  isDevel: boolean;

  private _isConnected = new BehaviorSubject<boolean>(true);
  isConnected$ = this._isConnected.asObservable();

  private _deviceInfo = new BehaviorSubject<DeviceInfo>(null);
  deviceInfo$ = this._deviceInfo.asObservable();

  private _deviceId = new BehaviorSubject<DeviceId>(null);
  deviceId$ = this._deviceId.asObservable();

  private _appResume = new BehaviorSubject<boolean>(false);
  appResume$ = this._appResume.asObservable();

  constructor(private plt: Platform, private logger: Logger) {
    this.plt.ready().then(_ => {
      this.plt.pause.subscribe(_ => {
        this.onPause();
      });
      this.plt.resume.subscribe(_ => {
        this.onResume();
      });
    });

    let ua = navigator ? navigator.userAgent : null;

    if (!ua) {
      this.logger.info('Could not determine navigator. Using fixed string');
      ua = 'dummy user-agent';
    }

    // Fixes IOS WebKit UA
    ua = ua.replace(/\(\d+\)$/, '');

    this.isAndroid = this.plt.is('android');
    this.isIOS = this.plt.is('ios');
    this.ua = ua;
    this.isCordova = this.plt.is('cordova') || this.plt.is('capacitor');
    this.isElectron = this.isElectronPlatform();
    this.isMobile = this.plt.is('mobile');
    this.isDevel = !this.isMobile && !this.isElectron;

    this.logger.debug('PlatformProvider initialized');
  }

  get deviceInfoValue(): DeviceInfo {
    return this._deviceInfo.value;
  }

  get deviceIdValue(): DeviceId {
    return this._deviceId.value;
  }

  get uuid(): string {
    return this.deviceIdValue?.uuid ?? '';
  }

  get os(): string {
    return this.deviceInfoValue?.operatingSystem ?? '';
  }

  get model(): string {
    return this.deviceInfoValue?.model ?? '';
  }

  get platform(): 'ios' | 'android' | 'electron' | 'web' | 'unknown' {
    return this.deviceInfoValue?.platform ?? 'unknown';
  }

  onPause() {
    console.log('On pause');
    this._appResume.next(false);
  }

  onResume() {
    console.log('On resume');
    this._appResume.next(true);
  }

  pushDeviceInfo(deviceInfo: DeviceInfo): DeviceInfo {
    this._deviceInfo.next(deviceInfo);
    return deviceInfo;
  }

  pushDeviceId(deviceId: DeviceId): DeviceId {
    this._deviceId.next(deviceId);
    return deviceId;
  }

  pushConnectionStatus(connected: boolean): boolean {
    this._isConnected.next(connected);
    return connected;
  }

  getBrowserName(): string {
    const userAgent = window.navigator.userAgent;
    const browsers = {
      chrome: /chrome/i,
      safari: /safari/i,
      firefox: /firefox/i,
      ie: /internet explorer/i,
    };

    for (const key in browsers) {
      if (browsers[key].test(userAgent)) {
        return key;
      }
    }

    return 'unknown';
  }

  isElectronPlatform(): boolean {
    const userAgent = navigator && navigator.userAgent ? navigator.userAgent.toLowerCase() : null;
    return userAgent && userAgent.indexOf('electron/') > -1;
  }

  getOS() {
    const OS = {
      OSName: '',
      extension: '',
    };

    if (this.isElectron) {
      if (navigator.appVersion.indexOf('Win') !== -1) {
        OS.OSName = 'Windows';
        OS.extension = '.exe';
      }
      if (navigator.appVersion.indexOf('Mac') !== -1) {
        OS.OSName = 'MacOS';
        OS.extension = '.dmg';
      }
      if (navigator.appVersion.indexOf('Linux') !== -1) {
        OS.OSName = 'Linux';
        OS.extension = '-linux.zip';
      }
    }

    return OS;
  }

  isNative(): boolean {
    return Capacitor.isNativePlatform();
  }

  async getDeviceInfo(): Promise<{ platform: string; uuid: string; language: string }> {
    const { platform } = await Device.getInfo();
    const { uuid } = await Device.getId();
    const { value: language } = await Device.getLanguageCode();
    return { platform, uuid, language };
  }

  /**
   * If platform that the app is running on is ready
   * get a device info from Capacitor. It returns
   * a DeviceInfo interface with information
   * about a user's current device.
   */
  ready(): Promise<any> {
    return this.plt
      .ready()
      .then(() => Device.getId())
      .then((id: DeviceId) => this.pushDeviceId(id))
      .then(() => Device.getInfo())
      .then((info: DeviceInfo) => this.pushDeviceInfo(info));
  }
}
