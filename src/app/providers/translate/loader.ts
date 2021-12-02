import { HttpClient } from '@angular/common/http';

import { from, Observable } from 'rxjs';
import { pluck } from 'rxjs/operators';
import { TranslateLoader } from '@ngx-translate/core';
import { Capacitor } from '@capacitor/core';

export class WebpackTranslateLoader implements TranslateLoader {
  constructor(private http: HttpClient, private prefix: string, private suffix: string) {}

  getTranslation(lang: string) {
    if (Capacitor.isNativePlatform() && lang.toLowerCase() !== 'en') {
      return new Observable(observer => {
        this.http.get(this.prefix + lang + this.suffix).subscribe(
          response => {
            observer.next(response as JSON);
            observer.complete();
          },
          () => {
            observer.next(null);
            observer.complete();
          },
        );
      });
    } else {
      return from(import(`../../../assets/languages/${lang}.json`)).pipe(pluck('default'));
    }
  }
}

export class AboutTranslateLoader implements TranslateLoader {
  getTranslation(lang: string) {
    if (Capacitor.isNativePlatform() && lang.toLowerCase() !== 'en') {
      return from(import(`../../../assets/languages/about/${lang}.ts`)).pipe(pluck('default'));
    } else {
      return from(import(`../../../assets/languages/about/${lang}.ts`)).pipe(pluck('default'));
    }
  }
}
