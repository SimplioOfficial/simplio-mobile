import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { SioEmbededChartComponent } from 'src/app/components/charts/sio-embeded-chart/sio-embeded-chart.component';
import { NgxEchartsModule } from 'ngx-echarts';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts'), // or import('./path-to-my-custom-echarts')
    }),
  ],
  declarations: [SioEmbededChartComponent],
  exports: [SioEmbededChartComponent],
})
export class SioChartsModule {}
