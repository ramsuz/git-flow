import { PLATFORM } from 'aurelia-pal';
import { inject } from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class MztRouter {
  heading = 'Mzt Router';

  logs = ['audit-trail', 'memos'];
  activeLog = 'audit-trail';

  auditTrailsItems = [];
  memosItems = [];

  constructor(eventAggregator) {
    this.eventAggregator = eventAggregator;
    this._sublevelChangedSubscription = this.eventAggregator
    .subscribe('sublevel-selected', response => {
      console.log('subscription response - mz-router: ' + response);
      this.loadLogs();
    });
  }
  
  configureRouter(config, router) {
    config.map([
      { route: ['', 'fileData'], name: 'file-data', moduleId: PLATFORM.moduleName('./mzt/file-data'), nav: true, title: 'File Data' },
      { route: 'sublevels', name: 'sublevels', moduleId: PLATFORM.moduleName('./mzt/sublevels/main'), nav: true, title: 'Sublevels' }
    ]);

    this.router = router;
  }

  activateLog(log) {
    this.activeLog = log;
    if (this.activeLog == 'audit-trail') {
      if (this.auditTrailsItems.length == 0) {
        this.getAuditTrails();
      }
    } else {
      if (this.memosItems.length == 0) {
        this.getMemos();
      }
    }
  }

  navigateBack() {
    this.router.navigateBack();
  }

  getAuditTrails() {
    this.auditTrailsItems.splice(0);
    this.auditTrailsItems.push.apply(this.auditTrailsItems, [{'type':'accept', 'value':'12354'}]);
  }

  getMemos() {
    this.memosItems.splice(0);
    this.memosItems.push.apply(this.memosItems, [{'type':'MM', 'value':'DD'}]);
  }

  loadLogs() {
    console.log('load data');
    if (this.activeLog == 'audit-trail') {
      this.getAuditTrails();
      this.memosItems.splice(0);
    } else {
      this.getMemos();
      this.auditTrailsItems.splice(0);
    }
  }

  bind() {
    console.log('bind mz-router');
  }
  
  unbind() {
    this._sublevelChangedSubscription.dispose();
    console.log('unbind mz-router');
  }
}
