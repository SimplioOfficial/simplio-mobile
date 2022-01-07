import {
  AfterViewInit,
  Component,
  ElementRef,
  HostBinding,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
// import { SwapStatusText } from 'src/app/interface/swap.js';
import { SvgIcon } from 'src/assets/icon/icons';
import { ThemeMode } from '../../../interface/settings';
import { SettingsProvider } from '../../../providers/data/settings.provider';

@Component({
  selector: 'sio-progress-circle',
  templateUrl: './sio-progress-circle.component.html',
  styleUrls: ['./sio-progress-circle.component.scss'],
})
export class SioProgressCircleComponent implements AfterViewInit, OnChanges {
  // static readonly progressValues = {
  //   _default: 0,
  //   [SwapStatusText.Validating]: 20,
  //   [SwapStatusText.Pending]: 40,
  //   [SwapStatusText.Swapping]: 60,
  //   [SwapStatusText.Withdrawing]: 80,
  //   [SwapStatusText.Completed]: 100,
  // };

  // static getProgress(status: SwapStatusText): number {
  //   return SioProgressCircleComponent.progressValues[status] || SioProgressCircleComponent.progressValues._default;
  // }

  @Input('stroke-width') strokeWidth = 0;
  @Input() size = 0;
  @Input() color = '';
  @Input() ticker: string = null;
  @Input() showCoinIcon = false;

  @ViewChild('loadingEl', { static: false }) loadingEl: ElementRef;
  @ViewChild('placeEl', { static: false }) placeEl: ElementRef;
  @ViewChild('svgEl', { static: false }) svgEl: ElementRef;

  @Input('progress') private inputProgress = 0;
  private circumference = 0;

  private mode: ThemeMode;
  private _color: string;
  get fill(): string {
    return this._color;
  }

  constructor(private settingsProvider: SettingsProvider) {
    this.mode = this.settingsProvider.settingsValue.theme.mode;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.progress) {
      this.setLoadingStatus();
    }
  }

  ngAfterViewInit() {
    this.initLoadingStatus();
    if (!this.ticker) {
      return;
    }

    this._importIcon(this.ticker).then(({ svg, graph, dark_graph }) => {
      const circle = this.loadingEl.nativeElement;
      if (!dark_graph) {
        dark_graph = graph;
      }
      circle.style.stroke = this.mode === ThemeMode.light ? graph : dark_graph;
      this._color = ThemeMode.light ? graph : dark_graph;
      if (this.showCoinIcon) {
        this.svgEl.nativeElement.innerHTML = svg();
      }
    });
  }

  initLoadingStatus() {
    const circle = this.loadingEl.nativeElement;
    this.circumference = Math.PI * (this.radius * 2);

    circle.style.strokeDasharray = `${this.circumference} ${this.circumference}`;
    circle.style.strokeDashoffset = `${this.circumference}`;

    this.setLoadingStatus();
  }

  setLoadingStatus() {
    const circle = this.loadingEl.nativeElement;
    circle.style.strokeDashoffset = this.setProgress(this.circumference);
  }

  setProgress(circumference) {
    return circumference - (this.progress / 100) * circumference;
  }

  get centralPoint(): number {
    return this.size / 2;
  }

  get progress(): number {
    if (this.inputProgress > 100) {
      return 100;
    } else if (this.inputProgress < 0) {
      return 0;
    } else {
      return this.inputProgress;
    }
  }

  get radius(): number {
    return this.centralPoint - this.strokeWidth;
  }

  @HostBinding('style.width') get sizeX() {
    return this.size + 'px';
  }

  @HostBinding('style.height') get sizeY() {
    return this.size + 'px';
  }

  private _importIcon(iconID): Promise<SvgIcon> {
    return import('../../../../assets/icon/icons.js')
      .then(mod => mod[iconID.toUpperCase()])
      .catch(console.error);
  }
}
