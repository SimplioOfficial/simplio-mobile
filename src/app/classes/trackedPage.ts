import { AppInjector } from '../services/app-injector.service';
import { AuthenticationProvider } from '../providers/data/authentication.provider';
import { FirebaseAnalytics } from '@ionic-native/firebase-analytics/ngx';
import { InsightMonitoringService } from '../services/insight-monitoring.service';

export abstract class TrackedPage {
  private _firebaseAnalytics: FirebaseAnalytics;
  private _authProvider: AuthenticationProvider;
  private _insightMonitoringService: InsightMonitoringService;

  protected constructor(login = false) {
    // Manually retrieve the dependencies from the injector
    // so that constructor has no dependencies that must be passed in from child
    const injector = AppInjector.getInjector();
    this._firebaseAnalytics = injector.get(FirebaseAnalytics);
    this._authProvider = injector.get(AuthenticationProvider);
    this._insightMonitoringService = injector.get(InsightMonitoringService);
    try {
      if (login) {
        this.login();
      } else {
        this.trackPage();
      }
    } catch (e) {
      // error in browser}
    }
  }

  private login() {
    this._firebaseAnalytics
      .setUserId(this._authProvider.accountValue.email)
      .then(() => this.trackPage());
  }

  private trackPage() {
    const name = this.constructor.name;
    this._firebaseAnalytics.setCurrentScreen(name).then(() => console.log(`Page ${name} tracked`));
    this._firebaseAnalytics
      .logEvent(name, { visited: name })
      .then(() => console.log(`Page ${name} tracked`));

    this._insightMonitoringService.logPageView(name);
  }
}
