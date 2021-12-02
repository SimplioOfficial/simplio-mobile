import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'sio-section-header',
  templateUrl: './sio-section-header.component.html',
  styleUrls: ['./sio-section-header.component.scss'],
})
export class SioSectionHeaderComponent implements OnInit {
  @Input() outlined = true;

  @Input('has-background') hasBackground = true;
  @Input('has-offset') hasOffset = false;
  @Input() scroll = false;

  constructor() {}

  ngOnInit() {}
}
