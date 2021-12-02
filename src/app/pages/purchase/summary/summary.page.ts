import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Translate } from 'src/app/providers/translate';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'purchase-summary-page',
  templateUrl: './summary.page.html',
  styleUrls: ['./summary.page.scss']
})
export class SummaryPage {
  constructor(private router: Router, private route: ActivatedRoute, private utils: UtilsService, public $: Translate) {}

  back() {
    this.router.navigate(['..'], {
      relativeTo: this.route.parent
    });
  }

  async onSubmit() {
    await this.router.navigate(['../agreement'], {
      relativeTo: this.route.parent
    });
  }
}
