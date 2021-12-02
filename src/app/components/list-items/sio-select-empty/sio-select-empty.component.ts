import { Component, Input } from '@angular/core';

export enum EmptyStatus {
  Error,
  Empty,
}

@Component({
  selector: 'sio-select-empty',
  templateUrl: './sio-select-empty.component.html',
  styleUrls: ['../generic-item.scss', './sio-select-empty.component.scss'],
})
export class SioSelectEmptyComponent {
  readonly stats = EmptyStatus;
  @Input() title: string;
  @Input() status = EmptyStatus.Empty;
}
