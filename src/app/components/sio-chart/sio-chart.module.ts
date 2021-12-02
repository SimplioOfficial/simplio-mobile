import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartDisplayComponent } from './chart-display/chart-display.component';
import { ChartButtonComponent } from './chart-button/chart-button.component';
import { SioChartBalanceComponent } from './balance/chart-balance/chart-balance.component';
import { SioChartCoinBalanceComponent } from './balance/chart-coin-balance/chart-coin-balance.component';
import { ChartsModule } from 'ng2-charts';
import { SIOchartComponent } from './sio-chart.component';
import { SioSharedModule } from '../shared/sio-shared.module';

@NgModule({
  declarations: [
    SIOchartComponent,
    ChartDisplayComponent,
    ChartButtonComponent,
    SioChartBalanceComponent,
    SioChartCoinBalanceComponent,
  ],
  imports: [CommonModule, ChartsModule, SioSharedModule],
  exports: [SIOchartComponent, SioChartBalanceComponent, SioChartCoinBalanceComponent],
  bootstrap: [SIOchartComponent],
})
export class ChartModule {}
