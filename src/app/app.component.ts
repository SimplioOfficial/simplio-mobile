import { ActivatedRoute, Data, NavigationEnd, Router } from '@angular/router';
import { IoService } from 'src/app/services/io.service';
import { SettingsService } from 'src/app/services/settings/settings.service';
import { AuthenticationProvider } from 'src/app/providers/data/authentication.provider';
import { TranslateService } from '@ngx-translate/core';
import { DataLoaderObject } from 'src/app/interface/database';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ThemeService } from 'src/app/services/settings/theme.service';
import { PlatformProvider } from './providers/platform/platform';
import { SettingsProvider } from './providers/data/settings.provider';
import { filter, map, mergeMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Acc } from './interface/user';
import { AccentColor, Settings, ThemeMode, ThemeSettings } from 'src/app/interface/settings';
import { ConnectionStatus, Network } from '@capacitor/network';
import { SplashScreen } from '@capacitor/splash-screen';
import { NetworkService } from './services/apiv2/connection/network.service';
import { CoinsService } from './services/apiv2/connection/coins.service';
import { LiveChatWidgetApiModel, LiveChatWidgetModel } from '@livechat/angular-widget';
import { LivechatService } from './services/livechat.service';
import { RateService } from './services/apiv2/connection/rate.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('liveChatWidget') liveChatWidget: LiveChatWidgetModel;

  readonly liveChatLicenceId = environment.LIVECHAT_LICENCE_ID;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private platform: PlatformProvider,
    private translate: TranslateService,
    private io: IoService,
    private sett: SettingsService,
    private theme: ThemeService,
    private authProvider: AuthenticationProvider,
    private settingsProvider: SettingsProvider,
    private networkService: NetworkService,
    private coinsService: CoinsService,
    private rateService: RateService,
    private liveChat: LivechatService,
  ) { }

  ngOnInit() {
    Network.addListener('networkStatusChange', s => this._resolveNetwork(s));
    Network.getStatus().then(s => this._resolveNetwork(s));
    const start = new Date().getTime();
    this.platform
      .ready()
      .then(() => this.io.initDb())
      .then(() => this.io.loadData())
      .then(data => this.subscribe(data))
      .then(data => this.start(data))
      .then(data => {
        const end = new Date().getTime();
        console.log('App started in', end - start, 'ms');
        return data;
      });
  }

  ngAfterViewInit() {
    this.liveChatWidget.onChatLoaded.subscribe((api: LiveChatWidgetApiModel) =>
      this.liveChat.initialize(api, this.liveChatWidget),
    );
    this.liveChatWidget.onAfterLoad.subscribe(() => this.liveChat.closeChat());
    this.liveChatWidget.onChatEnded.subscribe(() => {
      this.settingsProvider.setNotificationCount(0);
      this.liveChat.closeChat();
    });
    this.liveChatWidget.onChatWindowMinimized.subscribe(() => {
      this.settingsProvider.setNotificationCount(0);
      this.liveChat.minimalize();
    });

    this.liveChatWidget.onChatWindowHidden.subscribe(() =>
      this.settingsProvider.setNotificationCount(0),
    );

    this.liveChatWidget.onMessage.subscribe(() => {
      this.settingsProvider.increaseNotificationCount();
      if (this.liveChat.isHidden) {
        this.liveChat.openChat();
        this.liveChat.minimalize();
      }
    });
  }

  async start(data: DataLoaderObject): Promise<DataLoaderObject> {
    await this._resolveLatestTheme(data);
    await this._resolveStart(data);
    const initNetworkStatus = await this.networkService.init();
    if (!initNetworkStatus) {
      console.log('Init explorers issue');
    }
    const initCoinsStatus = await this.coinsService.init();
    if (!initCoinsStatus) {
      console.log('Init coins issue');
    }
    const initRate = await this.rateService.refresh(false);
    if (!initRate) {
      console.log('Init rate issue');
    }

    await SplashScreen.hide();

    return data;
  }

  private async subscribe(data: DataLoaderObject) {
    this.authProvider.isAuthenticated$.subscribe(s => this._resolveAuthentication(s));
    this.settingsProvider.language$.subscribe(l => this._resolveTranslation(l));
    this.settingsProvider.theme$.subscribe(th => this.theme.applyTheme(th));
    this.router.events
      .pipe(
        filter<NavigationEnd>(event => event instanceof NavigationEnd),
        map(() => this.route),
        map(route => {
          while (route.firstChild) route = route.firstChild;
          return route;
        }),
        filter(route => route.outlet === 'primary'),
        mergeMap(route => route.data),
        filter(data => 'tapbar' in data),
        map<Data, boolean>(data => data.tapbar),
      )
      .subscribe(t => this.settingsProvider.pushTapbarVisibility(t));
    return data;
  }

  private _resolveAuthentication(status: boolean) {
    if (status) this.router.navigate(['/home']);
    else this.router.navigate(['/intro']);
  }

  private _resolveTranslation(language: string = environment.DEFAULT_LANGUAGE) {
    if (language) return this.translate.use(language);
    if (this.translate.getBrowserLang() !== undefined) {
      this.translate.use(this.translate.getBrowserLang());
    } else {
      this.translate.use(language);
      this.sett.updateSettings({ language });
    }
  }

  private _resolveStart(data: DataLoaderObject) {
    if (!!data.account) this.router.navigate(['/auth'], { state: data.account });
    else this.authProvider.pushAccount(null);
  }

  private async _resolveLatestTheme(data: DataLoaderObject): Promise<ThemeSettings> {
    const acc: Acc = data?.account ?? null;
    const setts: Settings[] = data?.settings ?? [];
    const thm: ThemeSettings = {
      accent: AccentColor.default,
      mode: ThemeMode.light,
    };
    if (!acc) return this.theme.applyTheme(thm);

    const sett = setts.find(s => s.uid === acc.uid);
    if (!sett) return this.theme.applyTheme(thm);

    return this.theme.applyTheme(sett.theme);
  }

  private _resolveNetwork(status: ConnectionStatus) {
    this.platform.pushConnectionStatus(status.connected);
  }
}
