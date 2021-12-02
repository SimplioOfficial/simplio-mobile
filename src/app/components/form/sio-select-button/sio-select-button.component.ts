import { Component, OnInit, Input, ContentChild, TemplateRef } from '@angular/core';

@Component({
  selector: 'sio-select-button',
  templateUrl: './sio-select-button.component.html',
  styleUrls: ['./sio-select-button.component.scss'],
})
export class SioSelectButtonComponent implements OnInit {
  @Input() value = '';
  @Input() startValue: any;
  @Input() placeholder = '';

  @ContentChild('startTemplate', { static: false }) startTemplateRef: TemplateRef<any>;

  get hasValue(): boolean {
    return !!this.value;
  }

  ngOnInit() {}
}
