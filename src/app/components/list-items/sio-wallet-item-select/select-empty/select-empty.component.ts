import { Component, OnInit, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'select-empty',
  templateUrl: './select-empty.component.html',
  styleUrls: ['../../generic-item.scss', './select-empty.component.scss'],
})
export class SelectEmptyComponent implements OnInit {
  @Input() title: string;

  constructor() {}

  ngOnInit() {}
}
