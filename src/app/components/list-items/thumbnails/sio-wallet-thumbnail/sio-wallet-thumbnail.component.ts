import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { SvgIcon } from 'src/assets/icon/icons';
import { coinNames } from '@simplio/backend/api/utils/coins';
import { ThemeMode } from '../../../../interface/settings';
import { SettingsProvider } from '../../../../providers/data/settings.provider';
@Component({
  selector: 'sio-wallet-thumbnail',
  templateUrl: './sio-wallet-thumbnail.component.html',
  styleUrls: ['../generic-thumbnail.scss', '../generic-thumbnail.scss'],
})
export class SioWalletThumbnailComponent implements OnChanges, AfterViewInit {
  @Input() iconID = '';
  @Output() coloring = new EventEmitter<string>(null);
  @ViewChild('svg', { static: false }) svg: ElementRef;
  backgroundColor: string;

  private mode: ThemeMode;

  constructor(private settingsProvider: SettingsProvider) {
    this.mode = this.settingsProvider.settingsValue.theme.mode;
  }

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
        const id = typeof iconID !== 'string' ? '' : iconID;
        const m = mod[typeof iconID === 'string' ? iconID.toUpperCase() : coinNames.SIO] as SvgIcon;
        this.svg.nativeElement.innerHTML = m?.svg() ?? '';
        this.backgroundColor = m?.color ?? '';
        this.coloring.emit(this.mode === ThemeMode.light ? m?.graph : m?.dark_graph);
      })
      .catch(err => {
        console.error(err);
      });
  }
}
