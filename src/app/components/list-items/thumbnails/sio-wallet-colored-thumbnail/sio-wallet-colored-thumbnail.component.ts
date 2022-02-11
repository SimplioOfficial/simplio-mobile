import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ThemeMode } from 'src/app/interface/settings';
import { coinNames } from '@simplio/backend/api/utils/coins';

@Component({
  selector: 'sio-wallet-colored-thumbnail',
  templateUrl: './sio-wallet-colored-thumbnail.component.html',
  styleUrls: ['../generic-thumbnail.scss', 'sio-wallet-color-thumbnail.component.scss'],
})
export class SioWalletColoredThumbnailComponent implements OnChanges, AfterViewInit {
  @Input() iconID = '';
  @Input() mode: ThemeMode = ThemeMode.light;
  @Input('icon-opacity') iconOpacity = 1;
  @ViewChild('svg', { static: false }) svg: ElementRef<SVGElement>;

  constructor() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.iconID) {
      this.importIcon(changes.iconID.currentValue);
    }
  }

  ngAfterViewInit() {
    this.importIcon(this.iconID);
  }

  private importIcon(iconID: string = '') {
    if (!this.svg) return;
    import('../../../../../assets/icon/icons.js')
      .then(mod => {
        const m: any = mod[typeof iconID === 'string' ? iconID.toUpperCase() : coinNames.SIO];
        const c = this.mode === ThemeMode.light ? '#000' : '#fff';
        this.svg.nativeElement.innerHTML = m?.svg(c) ?? '';
        this.svg.nativeElement.style.opacity = this.iconOpacity.toString();
      })
      .catch(err => {
        console.error(err);
      });
  }
}
