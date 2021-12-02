import { Component, Input, OnInit } from '@angular/core';

enum AvatarSize {
  small = 30,
  medium = 60,
  large = 100,
}

@Component({
  selector: 'sio-avatar',
  templateUrl: './sio-avatar.component.html',
  styleUrls: ['./sio-avatar.component.scss'],
})
export class SioAvatarComponent implements OnInit {
  @Input() avatarSize: AvatarSize = AvatarSize.small;
  @Input() avatarID = 0;
  @Input() img?: string | null = null;

  constructor() {}

  ngOnInit() {}

  get hasImage() {
    return !!this.img;
  }
}
