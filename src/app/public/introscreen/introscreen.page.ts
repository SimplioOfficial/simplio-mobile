import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Translate } from 'src/app/providers/translate/';
import { TrackedPage } from '../../classes/trackedPage';

@Component({
  selector: 'introscreen',
  templateUrl: './introscreen.page.html',
  styleUrls: ['./introscreen.page.scss'],
})
export class IntroscreenPage extends TrackedPage {
  constructor(private router: Router, private route: ActivatedRoute, public $: Translate) {
    super();
  }

  navigate(route: string) {
    return this.router.navigate([route], {
      relativeTo: this.route.parent,
    });
  }
}
