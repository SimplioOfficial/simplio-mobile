import {
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';

import { Subscription } from 'rxjs';

import { History, HistoryItem, WalletHistory } from '../../interface/data';
import { SettingsProvider } from 'src/app/providers/data/settings.provider';
import { Settings } from 'src/app/interface/settings';

enum Periods {
  day,
  week,
  month,
  quarter,
}

export interface IAction {
  id: number;
  title: string;
  period: Periods;
  data?: HistoryItem[];
}

@Component({
  selector: 'sio-chart',
  templateUrl: './sio-chart.component.html',
  styleUrls: ['./sio-chart.component.scss'],
})
export class SIOchartComponent implements OnChanges, OnDestroy {
  @HostBinding('style.height') @Input() size?: string;

  @Input() chartData: History[] | WalletHistory[] = [];
  @Input() color: string;
  @Input() rate: number;
  @Input() loading = false;

  @Output() priceUpdated = new EventEmitter();

  @ViewChild('chartEl', { static: false }) chartEl: ElementRef<HTMLDivElement>;

  data: any[];
  activeChart: IAction;
  isActivated = false;
  actions: IAction[] = [
    {
      id: 1,
      title: '1D',
      period: Periods.day,
    },
    {
      id: 2,
      title: '1W',
      period: Periods.week,
    },
    {
      id: 3,
      title: '1M',
      period: Periods.month,
    },
    {
      id: 4,
      title: '3M',
      period: Periods.quarter,
    },
  ];

  activeActionID = 1;
  chartHeight = 200;
  settingsSubscription: Subscription;
  settings: Settings;

  constructor(private settingsProvider: SettingsProvider) {
    // this.chartHeight = window.screen.height / 5;
    this.settingsSubscription = this.settingsProvider.settings$.subscribe(data => {
      if (data) {
        this.settings = data;
        if (this.settings.graph) {
          const idx = this.actions.findIndex(e => e.title === this.settings.graph.period);
          this.activateChart(this.actions[idx]);
        }
      }
    });
  }

  ngOnChanges(change: SimpleChanges) {
    if (this.settings) {
      const idx = this.actions.findIndex(
        e => e.title === (this.settings.graph.period ? this.settings.graph.period : '1W'),
      );
      this.activateChart(this.actions[idx]);
    } else {
      this.activateChart(this.actions[1]);
    }
  }

  ngOnDestroy(): void {
    if (this.settingsSubscription) {
      this.settingsSubscription.unsubscribe();
    }
  }

  activate(val) {
    this.isActivated = val;
    if (!val) {
      this.priceUpdated.emit(null);
    }
  }

  activateChart(chart: any) {
    if (chart) {
      this.activeChart = {
        ...chart,
        data: this.getChartsData(chart.period).sort((a, b) => {
          return a.unixtime - b.unixtime;
        }),
      };
    }
  }

  onUpdatePriceContent(priceObj) {
    this.priceUpdated.emit(priceObj);
  }

  private getChartsData(per) {
    if (!this.chartData) return [];
    if (this.chartData.length === 1) {
      this.chartData = [...this.chartData, ...this.chartData];
    }
    const periords = {
      [Periods.day]: 86400,
      [Periods.week]: 86400 * 7,
      [Periods.month]: 86400 * 30,
      [Periods.quarter]: 86400 * 30 * 4,
    };
    const val = period => e => !(e.time < Math.floor(Date.now() / 1000) - period);
    return this.chartData.filter(val(periords[per]));
  }
}
