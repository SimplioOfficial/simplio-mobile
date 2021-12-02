import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { Browser } from '@capacitor/browser';

import { Translate, TranslateAboutPage } from 'src/app/providers/translate/';

import data from '../../../../../assets/appConfig.json';

export interface Info {
  commitHash: string;
  version: string;
  updated: Date;
}

@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss'],
  providers: [TranslateAboutPage],
})
export class AboutPage {
  readonly LINKS = {
    PRIV: 'https://simplio.io/privacy-policy',
    TERM: 'https://simplio.io/terms-of-service',
    COOKIE: 'https://simplio.io/cookie-policy',
    WEB: 'https://simplio.io',
    DISCORD: 'https://discord.com/invite/aKhjuwZmdP',
  };

  info = data as any as Info;
  terms = Object.entries(this.aboutTranslations);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public $: Translate,
    private aboutTranslations: TranslateAboutPage,
  ) {}

  back() {
    this.router.navigate(['..'], {
      relativeTo: this.route.parent,
    });
  }

  async open(url) {
    await Browser.open({ url });
  }
}
