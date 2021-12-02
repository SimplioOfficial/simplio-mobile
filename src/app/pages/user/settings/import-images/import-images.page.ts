import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-import-images',
  templateUrl: './import-images.page.html',
  styleUrls: ['./import-images.page.scss'],
})
export class ImportImagesPage implements OnInit {
  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {}

  back() {
    this.router.navigate(['..'], {
      relativeTo: this.route.parent,
    });
  }
}
