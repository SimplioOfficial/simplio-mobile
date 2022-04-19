import { DataProvider } from './providers/data/data';
import { Device } from '@ionic-native/device/ngx';
import { PlatformProvider } from './providers/platform/platform';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { IonicStorageModule } from '@ionic/storage';
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Logger } from './providers/logger/logger';

import { DecimalPipe } from '@angular/common';

import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';
import { SQLite } from '@ionic-native/sqlite/ngx';
import { LocalStorage } from './providers/persistence/storage/local-storage';

// Providers
import { AuthenticationProvider } from './providers/data/authentication.provider';
import { SettingsProvider } from './providers/data/settings.provider';
import { WalletsProvider } from './providers/data/wallets.provider';
import { TransactionsProvider } from './providers/data/transactions.provider';
import { SwapProvider } from './providers/data/swap.provider';
import { HTTP } from '@ionic-native/http/ngx';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { WebpackTranslateLoader } from './providers/translate/loader';

import { environment } from '../environments/environment';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { FirebaseAnalytics } from '@ionic-native/firebase-analytics/ngx';

export function createTranslateLoader(http: HttpClient) {
  return new WebpackTranslateLoader(http, environment.LANG_URL, '.json');
}
import { SioLayoutModule } from './components/layout/sio-layout.module';
import { SioFormModule } from './components/form/sio-form.module';
import { VerifyIdentityModalModule } from './pages/modals/verify-identity-modal/verify-identity.module';
import { TutorialsProvider } from 'src/app/providers/data/tutorials.provider';
import { AuthInterceptor } from 'src/app/interceptors/authentication.interceptor';
import { LivechatWidgetModule } from '@livechat/angular-widget';
import { SwipeluxInterceptor } from 'src/app/interceptors/swipelux.interceptor';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot({
      hardwareBackButton: false,
    }),
    AppRoutingModule,
    IonicStorageModule.forRoot(),
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    SioLayoutModule,
    SioFormModule,
    VerifyIdentityModalModule,
    TranslateModule.forRoot({
      defaultLanguage: 'en',
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
    }),
    LivechatWidgetModule,
  ],
  providers: [
    AuthenticationProvider,
    SettingsProvider,
    WalletsProvider,
    TransactionsProvider,
    TutorialsProvider,
    SwapProvider,
    Logger,
    PlatformProvider,
    Device,
    DecimalPipe,
    DataProvider,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    SQLitePorter,
    SQLite,
    LocalStorage,
    HTTP,
    Diagnostic,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: SwipeluxInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    { provide: Window, useValue: window },
    FirebaseAnalytics,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
