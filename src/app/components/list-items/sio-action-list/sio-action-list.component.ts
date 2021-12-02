import { Component, Input, OnInit } from '@angular/core';
import { Action } from 'src/app/components/list-items/sio-action-item/sio-action-item.component';

@Component({
  selector: 'sio-action-list',
  templateUrl: './sio-action-list.component.html',
  styleUrls: ['./sio-action-list.component.scss'],
})
export class SioActionListComponent implements OnInit {
  @Input() actions: Action[];
  @Input() disabled = false;
  constructor() {}

  ngOnInit() {}
}
