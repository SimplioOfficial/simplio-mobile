import { Injectable } from '@angular/core';
import { Resolve, ActivatedRoute, Router } from '@angular/router';

@Injectable()
export class AddTokenResolver implements Resolve<any> {
  constructor(private route: ActivatedRoute, private router: Router) {}

  resolve() {
    const a = this.route.snapshot.queryParams;
    console.log(a);
    // console.log(this.router)
    return true;
  }
}
