import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { EChartsOption } from 'echarts';

@Component( {
  selector: 'sio-embeded-chart',
  templateUrl: './sio-embeded-chart.component.html',
  styleUrls: ['./sio-embeded-chart.component.scss']
} )
export class SioEmbededChartComponent implements OnChanges {
  private readonly _green = '#2dd36f';
  private readonly _red = '#eb445a';
  private readonly _initialDataset = [0];

  @Input() dataset: number[]

  options: EChartsOption = {
    xAxis: {
      type: 'category',
      axisLabel: {
        show: false,
      },
      axisPointer: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      axisLine: {
        show: false,
        onZero: true,
      },
      splitLine: {
        show: false
      },
    },
    yAxis: {
      type: 'value',

      min: 0,
      axisLabel: {
        show: false,
      },
      axisPointer: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      axisLine: {
        show: false,
        onZero: false,
      },
      splitLine: {
        show: false
      },
    },

    grid: {
      top: 4,
      right: 4,
      bottom: 4,
      left: 4,
      show: false,
      containLabel: false,
    },
    legend: {
      show: false,
    },

    series: [],
  };

  ngOnChanges(ch: SimpleChanges) {
    if (!ch?.dataset) return;

    const data = ch.dataset.currentValue;
    this.options.series = [{
        type: 'line',
        smooth: true,
        animation: true,
        data: this._makeDataset(data),
        color: this._makeColor(data),
    }]
  }

  private _makeDataset(data: number[] = []): number[] {
    return [].concat(this._initialDataset, data);
  }

  private _makeColor(data: number[] = []): string {
    if (data.length < 2) return this._green;

    const a = data[data.length - 2];
    const b = data[data.length - 1];

    if (b >= a) return this._green;
    return this._red;
  }

}

