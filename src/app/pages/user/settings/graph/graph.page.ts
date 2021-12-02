import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SettingsService } from 'src/app/services/settings/settings.service';
import { SettingsProvider } from 'src/app/providers/data/settings.provider';
import { Translate } from 'src/app/providers/translate/';
import { ChartView, GraphSettings, Settings } from 'src/app/interface/settings';
import { Location } from '@angular/common';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.page.html',
  styleUrls: ['./graph.page.scss'],
})
export class GraphPage implements OnInit, OnDestroy {
  chartView: ChartView[] = Object.values(ChartView) as ChartView[];

  private subscription = new Subscription();
  private settings: Settings = null;

  constructor(
    private location: Location,
    private settingsService: SettingsService,
    private settingsProvider: SettingsProvider,
    public $: Translate,
  ) {}

  ngOnInit() {
    const settingsSubscription = this.settingsProvider.settings$.subscribe(settings => {
      if (!settings) {
        return;
      }
      this.settings = settings;
    });

    this.subscription.add(settingsSubscription);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  get chartPeriod(): string {
    return this.settings.graph?.period || ChartView.Week;
  }

  set chartPeriod(period: string) {
    this._updateGrapgSettings({ period });
  }

  get enableGraph(): boolean {
    return this.settings.graph?.enableGraph ?? false;
  }

  set enableGraph(enableGraph: boolean) {
    this._updateGrapgSettings({ enableGraph });
  }

  private _updateGrapgSettings(graphSettings: Partial<GraphSettings>): void {
    const graph: GraphSettings = {
      ...this.settings.graph,
      ...graphSettings,
    };
    this.settingsService.updateSettings({ graph });
  }
}
