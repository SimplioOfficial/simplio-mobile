import { Component, ContentChild, TemplateRef } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith, tap } from 'rxjs/operators';

@Component({
  selector: 'sio-tapbar',
  templateUrl: './sio-tapbar.component.html',
  styleUrls: ['./sio-tapbar.component.scss'],
})
export class SioTapbarComponent {
  @ContentChild('tapbarTemplate', { static: false }) tapbarTemplateRef: TemplateRef<any>;

  url$ = this.router.events.pipe(
    filter<NavigationEnd>(event => event instanceof NavigationEnd),
    map<NavigationEnd, string>(r => r.urlAfterRedirects),
    startWith(this.router.url),
    map(r => this._format(r)),
  );

  constructor(private router: Router) {}

  private _format(url: string) {
    return url.split('/').filter(s => !!s);
  }
}
