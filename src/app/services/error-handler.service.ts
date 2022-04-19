import { ErrorHandler, Injectable } from '@angular/core';
import { InsightMonitoringService } from './insight-monitoring.service';

@Injectable()
export class ErrorHandlerService extends ErrorHandler {
  constructor(private monitoringService: InsightMonitoringService) {
    super();
  }

  handleError(error: Error) {
    this.monitoringService.logException(error); // Manually log exception
  }
}
