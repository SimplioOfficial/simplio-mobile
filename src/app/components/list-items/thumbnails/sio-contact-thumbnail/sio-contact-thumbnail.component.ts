import { Component, Input } from '@angular/core';

@Component({
  selector: 'sio-contact-thumbnail',
  templateUrl: './sio-contact-thumbnail.component.html',
  styleUrls: ['./sio-contact-thumbnail.component.scss'],
})
export class SioContactThumbnailComponent {
  @Input() contactImg: string;
  @Input() name = '';

  constructor() {}

  get acronym(): string {
    return this.name
      .split(' ')
      .map(l => (l[0] ? l[0].toUpperCase() : ''))
      .join('');
  }
}
