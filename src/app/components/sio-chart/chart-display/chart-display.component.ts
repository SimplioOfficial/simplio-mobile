import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewChild,
} from '@angular/core';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { Label } from 'ng2-charts';
import { HistoryItem } from 'src/app/interface/data';

@Component({
  selector: 'chart-display',
  templateUrl: './chart-display.component.html',
  styleUrls: ['./chart-display.component.scss'],
})
export class ChartDisplayComponent implements OnChanges {
  @Input() color = '#000';
  @Input() isActive: boolean;
  @Input() loading = true;
  @Input() height: number;
  @Input() rate: number;
  @Input() datasets: HistoryItem[];

  @Output() priceUpdated: EventEmitter<object> = new EventEmitter();

  @ViewChild('chartCanvas', { static: true }) chartCanvas: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartEl', { static: true }) chartEl: ElementRef<HTMLCanvasElement>;

  lineChartData: ChartDataSets[] = [];
  lineChartLabels: Label[];
  lineChartOptions: ChartOptions = {
    aspectRatio: 2,
    responsive: true,
    maintainAspectRatio: false,
    responsiveAnimationDuration: 0,
    animation: {
      duration: 0,
    },
    scales: {
      ticks: {
        min: 0,
      },
      xAxes: [
        {
          ticks: {
            beginAtZero: false,
          },
          display: false,
        },
      ],
      yAxes: [
        {
          ticks: {
            beginAtZero: true,
            autoSkip: true,
          },
          display: false,
        },
      ],
    },
    legend: {
      display: false,
    },
    elements: {
      line: {
        fill: true,
        borderWidth: 2,
      },
      point: {
        pointStyle: 'circle',
        borderWidth: 0,
        backgroundColor: this.color,
        borderColor: this.color,
        radius: 0,
        hoverRadius: 0,
      },
    },
    layout: {
      padding: {
        bottom: 10,
        top: 10,
      },
    },
    events: ['mousemove', 'touchmove'],
    tooltips: {
      enabled: true,
      mode: 'index',
      intersect: false,
      custom: a => {
        a.width = 0.6;
        a.height = this.chartCanvas.nativeElement.clientHeight + 60;
        a.backgroundColor = '#6f6f6f';
        a.xPadding = 0;
        a.footerMarginTop = 0;
        a.afterBody = [];
        a.beforeBody = [];
        a.y = -30;
        a.x = a.caretX;
        a.body = [];
        a.yAlign = 'right';
        a.caretSize = 0;
        a.title = [''];
        a.backgroundColor = this.isActive ? '#6f6f6f' : '#ffffff00';

        if (this.isActive) {
          this.updatePrice({
            unixtime: parseFloat(a.dataPoints[0].label) * 1000,
            balance: parseFloat(a.dataPoints[0].value),
          });
        }
      },
    },
  };

  lineChartType = 'line';

  ngOnChanges() {
    this.lineChartData = [
      {
        data: this.datasets.map(d => d.balance * this.rate),
        fill: false,
        borderColor: this.color,
        pointBackgroundColor: this.color,
      },
    ];
    this.lineChartLabels = this.datasets.map(dat => dat.unixtime.toString());
  }

  updatePrice(priceObj: HistoryItem) {
    this.priceUpdated.emit(priceObj);
  }
}
